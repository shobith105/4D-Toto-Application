# app/schemas/ticket_ocr.py
import re
from datetime import date
from typing import Optional, Literal, List

from pydantic import BaseModel, Field, conint, confloat, model_validator

# -------------------------
# 4D
# -------------------------

FourDEntryType = Literal["Ordinary", "Roll", "System", "iBet"]


class FourDBet(BaseModel):
    """
    One 4D bet line. Keep it minimal but sufficient for win logic.
    - Ordinary/System/iBet: use `number` (4-digit string, keep leading zeros)
    - Roll: use `roll_pattern` (4 chars with exactly one 'X', e.g. 58X2)
    """
    entry_type: FourDEntryType

    number: Optional[str] = Field(default=None, description="4 digits as string, e.g. '0280'")
    roll_pattern: Optional[str] = Field(default=None, description="Roll pattern like '58X2' (one X)")

    big_amount: confloat(ge=0) = 0.0
    small_amount: confloat(ge=0) = 0.0

    # Optional: printed on some tickets (esp System/iBet). Can be derived later too.
    permutations: Optional[conint(ge=1, le=24)] = None

    @model_validator(mode="after")
    def _validate(self):
        if self.entry_type in ("Ordinary", "System", "iBet"):
            if self.number is None or not re.fullmatch(r"\d{4}", self.number):
                raise ValueError("For Ordinary/System/iBet, number must be a 4-digit string.")
            if self.roll_pattern is not None:
                raise ValueError("roll_pattern must be null unless entry_type='Roll'.")

        if self.entry_type == "Roll":
            if self.roll_pattern is None:
                raise ValueError("For Roll, roll_pattern is required.")
            rp = self.roll_pattern.strip().upper()
            if not (len(rp) == 4 and all(c.isdigit() or c == "X" for c in rp) and rp.count("X") == 1):
                raise ValueError("roll_pattern must be 4 chars with exactly one 'X', e.g. '58X2'.")
            if self.number is not None:
                raise ValueError("number must be null for Roll.")

        return self


# -------------------------
# TOTO
# -------------------------

TotoBetType = Literal["Ordinary", "System", "SystemRoll"]
SystemSize = Optional[conint(ge=7, le=12)]


class TotoSystemRoll(BaseModel):
    """
    System Roll Entry: 5 fixed numbers + rolling last number range (inclusive).
    """
    fixed_numbers: List[conint(ge=1, le=49)] = Field(..., min_length=5, max_length=5)
    roll_from: conint(ge=1, le=49)
    roll_to: conint(ge=1, le=49)

    @model_validator(mode="after")
    def _validate(self):
        if self.roll_from > self.roll_to:
            raise ValueError("roll_from must be <= roll_to.")
        if len(set(self.fixed_numbers)) != 5:
            raise ValueError("fixed_numbers must be 5 unique integers.")
        return self


class TotoEntry(BaseModel):
    bet_type: TotoBetType

    # Ordinary: exactly 6 numbers
    # System: numbers length = system_size (7..12)
    numbers: Optional[List[conint(ge=1, le=49)]] = None

    system_size: Optional[SystemSize] = None
    system_roll: Optional[TotoSystemRoll] = None

    

    @model_validator(mode="after")
    def _validate(self):
        if self.bet_type == "Ordinary":
            if self.numbers is None or len(self.numbers) != 6:
                raise ValueError("TOTO Ordinary requires numbers length 6.")
            if self.system_size is not None or self.system_roll is not None:
                raise ValueError("TOTO Ordinary: system_size and system_roll must be null.")
            if len(set(self.numbers)) != 6:
                raise ValueError("TOTO Ordinary numbers must be unique.")

        elif self.bet_type == "System":
            if self.system_size is None:
                raise ValueError("TOTO System requires system_size.")
            if self.numbers is None or len(self.numbers) != self.system_size:
                raise ValueError("TOTO System requires numbers length = system_size.")
            if self.system_roll is not None:
                raise ValueError("TOTO System: system_roll must be null.")
            if len(set(self.numbers)) != len(self.numbers):
                raise ValueError("TOTO System numbers must be unique.")

        elif self.bet_type == "SystemRoll":
            if self.system_roll is None:
                raise ValueError("TOTO SystemRoll requires system_roll.")
            if self.numbers is not None or self.system_size is not None:
                raise ValueError("TOTO SystemRoll: numbers and system_size must be null.")

        return self



# -------------------------
# Single top-level model for BOTH games
# -------------------------

class TicketCreateData(BaseModel):
    """
    Single model your OCR returns.
    Validator enforces the correct branch based on game_type.
    """
    game_type: Literal["4D", "TOTO"]
    draw_date: date                 # OCR should output ISO: YYYY-MM-DD
    ticket_price: confloat(ge=0)

    # 4D branch
    fourd_bets: Optional[List[FourDBet]] = None

    # TOTO branch
    toto_entry: Optional[TotoEntry] = None

    @model_validator(mode="after")
    def _validate(self):
        if self.game_type == "4D":
            if not self.fourd_bets:
                raise ValueError("4D tickets require fourd_bets.")
            if self.toto_entry is not None:
                raise ValueError("4D tickets must have toto_entry=null.")

        if self.game_type == "TOTO":
            if self.toto_entry is None:
                raise ValueError("TOTO tickets require toto_entry.")
            if self.fourd_bets is not None:
                raise ValueError("TOTO tickets must have fourd_bets=null.")

        return self

from pydantic import BaseModel
from datetime import date
from typing import Optional


class OCRResult(BaseModel):
    """Result from OCR processing of ticket image"""
    game_type: str  # "4D" or "TOTO"
    bet_type: str  # "standard" or "system"
    system_size: Optional[int] = None  # For system bets
    raw_numbers: list[int]
    draw_date: date
    purchase_date: Optional[date] = None
    confidence_score: float  # OCR confidence (0-1)
    raw_text: Optional[str] = None  # Full extracted text for debugging

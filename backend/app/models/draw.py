from pydantic import BaseModel
from datetime import date
from typing import Optional
from uuid import UUID


class DrawResult(BaseModel):
    """Model for draw results from Singapore Pools"""
    draw_id: Optional[UUID] = None
    draw_date: date
    game_type: str  # "4D" or "TOTO"
    winning_numbers: list[int]
    additional_number: Optional[int] = None  # For TOTO additional number
    prize_breakdown: Optional[dict] = None  # Prize tier details
    

class DrawCheckRequest(BaseModel):
    """Request to check ticket against draw results"""
    ticket_id: UUID
    draw_date: Optional[date] = None  # If not provided, use ticket's draw_date

from pydantic import BaseModel
from datetime import date
from typing import Optional
from uuid import UUID


class TicketUploadRequest(BaseModel):
    """Request model for uploading a ticket image"""
    image_data: str  # Base64 encoded image
    

class TicketCreateData(BaseModel):
    """Data extracted from OCR to create a ticket"""
    user_id: UUID
    game_type: str  # "4D" or "TOTO"
    draw_date: date
    purchase_date: date
    bet_type: str  # "standard" or "system"
    system_size: Optional[int] = None  # For TOTO system bets: 7, 8, 9, etc.
    raw_numbers: list[int]  # Original numbers from ticket
    expanded_combos: Optional[list[list[int]]] = None  # For system bets
    image_url: Optional[str] = None


class TicketResponse(BaseModel):
    """Response model for ticket data"""
    uuid: UUID
    game_type: str
    draw_date: date
    purchase_date: date
    bet_type: str
    system_size: Optional[int] = None
    raw_numbers: list[int]
    expanded_combos: Optional[list[list[int]]] = None
    image_url: Optional[str] = None
    win_status: Optional[str] = None  # "pending", "win", "loss"
    prize_amount: Optional[float] = None
    

class TicketListResponse(BaseModel):
    """Response model for listing tickets"""
    tickets: list[TicketResponse]
    total: int

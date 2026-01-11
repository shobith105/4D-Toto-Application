from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from uuid import UUID
from app.models import TicketUploadRequest, TicketResponse, TicketListResponse

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.post("/upload", response_model=TicketResponse)
async def upload_ticket(request: TicketUploadRequest):
    """Upload a ticket image for OCR processing"""
    # TODO: Implement OCR processing
    # TODO: Expand TOTO system bets if applicable
    # TODO: Store in Supabase
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/", response_model=TicketListResponse)
async def list_tickets(user_id: UUID):
    """List all tickets for a user"""
    # TODO: Fetch from Supabase
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: UUID):
    """Get a specific ticket by ID"""
    # TODO: Fetch from Supabase
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/{ticket_id}/check")
async def check_ticket(ticket_id: UUID):
    """Check a ticket against latest draw results"""
    # TODO: Fetch ticket from Supabase
    # TODO: Fetch corresponding draw results
    # TODO: Match all combinations (including expanded System bets)
    # TODO: Update ticket with win status
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: UUID):
    """Delete a ticket"""
    # TODO: Delete from Supabase
    raise HTTPException(status_code=501, detail="Not implemented yet")

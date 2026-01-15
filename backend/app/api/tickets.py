from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import ValidationError
from uuid import UUID
from app.models import TicketCreateData
from app.ocr.ocr_engine import process_image_with_gemini
from app.services.dbconfig import authorised_user, save_ticket_details

router = APIRouter(prefix="/tickets", tags=["tickets"])

ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload")
async def upload_ticket(file: UploadFile = File(...), user_id: UUID = Depends(authorised_user)):
    """
    Upload ticket image and extract information using Gemini OCR
    
    Args:
        File: Uploaded image file of the ticket
    """
    print("reading file")
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PNG, JPEG, WEBP, and BMP are allowed.",
        )

    #Potential bug fix needed for large files
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is 5MB, uploaded file is {len(image_bytes)/(1024*1024):.2f}MB",
        )

    try:
        # Gemini OCR should return JSON matching TicketCreateData schema
        ocr_result = process_image_with_gemini(image_bytes, file.content_type)

        # Pydantic v2 validation
        ticket_data = TicketCreateData.model_validate(ocr_result)

        return {
            "status": "success",
            "message": "Ticket processed successfully",
            "data": ticket_data.model_dump(),
        }

    except ValidationError as e:
        # Gemini output didn't match schema/constraints
        print("Validation error:", e.errors())
        raise HTTPException(status_code=422, detail=e.errors())
    except ValueError as e:
        # Your OCR function raised ValueError (e.g., JSON parse failure)
        raise HTTPException(status_code=422, detail=f"OCR processing error: {str(e)}")
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/")
async def list_tickets(user_id: UUID):
    """List all tickets for a user"""
    # TODO: Fetch from Supabase
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{ticket_id}")
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

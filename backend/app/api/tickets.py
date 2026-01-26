from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import ValidationError
from uuid import UUID
from app.models import TicketCreateData
from app.ocr.ocr_engine import process_image_with_gemini
from app.ocr.ocr_timeout import run_blocking_with_timeout
from app.services.dbconfig import authorised_user, save_ticket_details,supabase

router = APIRouter(prefix="/tickets", tags=["tickets"])

ALLOWED_MIME = {"image/png", "image/jpeg", "image/webp", "image/bmp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload")
async def upload_ticket(file: UploadFile = File(...), user_id: UUID = Depends(authorised_user)):
    print("reading file")
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PNG, JPEG, WEBP, and BMP are allowed.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is 5MB, uploaded file is {len(image_bytes)/(1024*1024):.2f}MB",
        )

    try:
        ocr_result = await run_blocking_with_timeout(
            process_image_with_gemini,
            image_bytes,
            file.content_type,
            timeout_s=15,   # test
        )

        ticket_data = TicketCreateData.model_validate(ocr_result)

        return {
            "status": "success",
            "message": "Ticket processed successfully",
            "data": ticket_data.model_dump(),
        }

    except ValidationError as e:
        print("Validation error:", e.errors())
        raise HTTPException(status_code=422, detail=e.errors(include_context=False))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"OCR processing error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        print("Unexpected error:", str(e))
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")



@router.get("/")
async def list_tickets(user_id: UUID = Depends(authorised_user)):
    """List all tickets for a user"""
    try:
        # Fetch tickets for the authenticated user
        response = supabase.table("tickets").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
        
        if not response.data:
            return {
                "status": "success",
                "tickets": []
            }
        
        return {
            "status": "success",
            "tickets": response.data
        }
        
    except Exception as e:
        print(f"Error fetching tickets: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tickets: {str(e)}")


@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: UUID, user_id: UUID = Depends(authorised_user)):
    """Delete a ticket owned by the authenticated user."""
    try:

        response = (
            supabase
            .table("tickets")
            .delete()
            .eq("id", str(ticket_id))
            .eq("user_id", str(user_id))
            .execute()
        )

        if not getattr(response, "data", None):
            raise HTTPException(status_code=404, detail="Ticket not found")

        return {
            "status": "success",
            "message": "Ticket deleted successfully",
            "ticket_id": str(ticket_id),
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting ticket {ticket_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete ticket")

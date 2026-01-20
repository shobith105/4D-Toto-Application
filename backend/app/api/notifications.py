from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID
from app.services.dbconfig import supabase, authorised_user

router = APIRouter()

@router.post("/notifications/mock")
async def create_mock_notification(user_id: UUID = Depends(authorised_user)):
    """Create a mock notification for testing purposes"""
    try:
        
        # Create a mock notification
        mock_notification = {
            "user_id": str(user_id),
            "type": "win",
            "title": "🎉 Congratulations! You Won!",
            "message": "Your ticket has won a prize in the latest 4D draw! Check the details below.",
            "data": {
                "game_type": "4D",
                "draw_date": "2026-01-19",
                "prize_amount": "2500.00",
                "ticket_numbers": "1234",
                "winning_numbers": "1234, 5678, 9012"
            },
            "is_read": False,
            "created_at": datetime.now().isoformat()
        }
        
        # Insert the notification into the database
        response = supabase.table('notifications').insert(mock_notification).execute()
        
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create notification")
        
        return {
            "message": "Mock notification created successfully",
            "notification": response.data[0]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notifications")
async def get_notifications(user_id: UUID = Depends(authorised_user)):
    """Get all notifications for the authenticated user"""
    try:
        # Fetch notifications from the database
        response = supabase.table('notifications').select('*').eq('user_id', str(user_id)).order('created_at', desc=True).execute()
        
        return {
            "notifications": response.data or []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/notifications/{notification_id}/read")
async def mark_notification_as_read(notification_id: str, user_id: UUID = Depends(authorised_user)):
    """Mark a notification as read"""
    try:
        # Update the notification, but only if it belongs to the authenticated user
        response = supabase.table('notifications').update({"is_read": True}).eq('id', notification_id).eq('user_id', str(user_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Notification not found or unauthorized")
        
        return {
            "message": "Notification marked as read",
            "notification": response.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/notifications/mark-all-read")
async def mark_all_notifications_as_read(user_id: UUID = Depends(authorised_user)):
    """Mark all notifications as read for the authenticated user"""
    try:
        response = supabase.table('notifications').update({"is_read": True}).eq('user_id', str(user_id)).eq('is_read', False).execute()
        
        return {
            "message": "All notifications marked as read",
            "count": len(response.data) if response.data else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: str, user_id: UUID = Depends(authorised_user)):
    """Delete a notification"""
    try:
        # Delete the notification, but only if it belongs to the authenticated user
        response = supabase.table('notifications').delete().eq('id', notification_id).eq('user_id', str(user_id)).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Notification not found or unauthorized")
        
        return {
            "message": "Notification deleted successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

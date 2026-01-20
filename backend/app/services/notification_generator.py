"""
Notification service for creating user notifications based on ticket check results.
"""

from typing import Dict, Any, List
from app.services.dbconfig import supabase
from fastapi import HTTPException


def create_win_notification(ticket_check: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a notification for a winning ticket check.
    
    Args:
        ticket_check: The ticket_check record with win details
    
    Returns:
        Created notification record
    """
    try:
        # Get ticket details
        ticket_response = supabase.table('tickets').select('*, draw_results!inner(*)').eq('id', ticket_check['ticket_id']).single().execute()
        
        if not ticket_response.data:
            raise ValueError(f"Ticket not found: {ticket_check['ticket_id']}")
        
        ticket = ticket_response.data
        user_id = ticket.get('user_id')
        game_type = ticket.get('game_type', '').upper()
        
        # Get draw details
        draw_response = supabase.table('draw_results').select('*').eq('id', ticket_check['draw_id']).single().execute()
        
        if not draw_response.data:
            raise ValueError(f"Draw not found: {ticket_check['draw_id']}")
        
        draw = draw_response.data
        draw_date = draw.get('draw_date')
        draw_no = draw.get('draw_no')
        
        # Calculate prize information
        prize_group = ticket_check.get('highest_prize_group')
        winning_combinations = len(ticket_check.get('details', []))
        
        # Create notification message
        title = f"🎉 Congratulations! You Won {game_type}!"
        message = f"Your ticket has won Prize Group {prize_group} in the {game_type} Draw #{draw_no}!"
        
        if winning_combinations > 1:
            message += f" You have {winning_combinations} winning combinations!"
        
        # Prepare notification data
        from datetime import datetime, timezone
        
        notification_data = {
            "user_id": user_id,
            "type": "win",
            "title": title,
            "message": message,
            "data": {
                "game_type": game_type,
                "draw_date": str(draw_date),
                "draw_no": draw_no,
                "prize_group": prize_group,
                "winning_combinations": winning_combinations,
                "ticket_id": ticket_check['ticket_id'],
                "ticket_check_id": ticket_check['id']
            },
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert notification (use upsert to avoid duplicates)
        # Check if notification already exists for this ticket_check
        existing = supabase.table('notifications').select('id').eq('data->>ticket_check_id', ticket_check['id']).execute()
        
        if existing.data and len(existing.data) > 0:
            # Notification already exists, skip
            return existing.data[0]
        
        response = supabase.table('notifications').insert(notification_data).execute()
        
        if not response.data:
            raise ValueError("Failed to create notification")
        
        return response.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create notification: {str(e)}")


def create_loss_notification(ticket_check: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a notification for a losing ticket check.
    
    Args:
        ticket_check: The ticket_check record
    
    Returns:
        Created notification record
    """
    try:
        # Get ticket details
        ticket_response = supabase.table('tickets').select('*').eq('id', ticket_check['ticket_id']).single().execute()
        
        if not ticket_response.data:
            raise ValueError(f"Ticket not found: {ticket_check['ticket_id']}")
        
        ticket = ticket_response.data
        user_id = ticket.get('user_id')
        game_type = ticket.get('game_type', '').upper()
        
        # Get draw details
        draw_response = supabase.table('draw_results').select('*').eq('uid', ticket_check['draw_id']).single().execute()
        
        if not draw_response.data:
            raise ValueError(f"Draw not found: {ticket_check['draw_id']}")
        
        draw = draw_response.data
        draw_date = draw.get('draw_date')
        draw_no = draw.get('draw_no')
        
        # Create notification message
        title = f"Draw Results: {game_type} Draw #{draw_no}"
        message = f"Your ticket for {game_type} Draw #{draw_no} did not win this time. Better luck next draw!"
        
        # Prepare notification data
        from datetime import datetime, timezone
        
        notification_data = {
            "user_id": user_id,
            "type": "loss",
            "title": title,
            "message": message,
            "data": {
                "game_type": game_type,
                "draw_date": str(draw_date),
                "draw_no": draw_no,
                "ticket_id": ticket_check['ticket_id'],
                "ticket_check_id": ticket_check['id']
            },
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Insert notification (check if already exists)
        existing = supabase.table('notifications').select('id').eq('data->>ticket_check_id', ticket_check['id']).execute()
        
        if existing.data and len(existing.data) > 0:
            # Notification already exists, skip
            return existing.data[0]
        
        response = supabase.table('notifications').insert(notification_data).execute()
        
        if not response.data:
            raise ValueError("Failed to create notification")
        
        return response.data[0]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create notification: {str(e)}")


def generate_notifications_for_draw(draw_id: str, notify_losses: bool = False) -> Dict[str, Any]:
    """
    Generate notifications for all ticket checks of a specific draw.
    
    Args:
        draw_id: UUID of the draw
        notify_losses: Whether to create notifications for losing tickets (default: False)
    
    Returns:
        Summary of notifications created
    """
    try:
        # Get all ticket checks for this draw
        checks_response = supabase.table('ticket_checks').select('*').eq('draw_id', draw_id).execute()
        
        checks = checks_response.data or []
        
        results = {
            "draw_id": draw_id,
            "total_checks": len(checks),
            "win_notifications": 0,
            "loss_notifications": 0,
            "errors": []
        }
        
        for check in checks:
            try:
                if check.get('is_win'):
                    create_win_notification(check)
                    results["win_notifications"] += 1
                elif notify_losses:
                    create_loss_notification(check)
                    results["loss_notifications"] += 1
            except Exception as e:
                results["errors"].append({
                    "ticket_check_id": check.get('id'),
                    "error": str(e)
                })
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notifications: {str(e)}")


def generate_notifications_for_all_checks(notify_losses: bool = False) -> Dict[str, Any]:
    """
    Generate notifications for all ticket checks that don't have notifications yet.
    This is idempotent - checks if notification already exists before creating.
    
    Args:
        notify_losses: Whether to create notifications for losing tickets (default: False)
    
    Returns:
        Summary of all notifications created
    """
    try:
        # Get all ticket checks
        checks_response = supabase.table('ticket_checks').select('*').execute()
        
        checks = checks_response.data or []
        
        results = {
            "total_checks_processed": 0,
            "win_notifications": 0,
            "loss_notifications": 0,
            "skipped": 0,
            "errors": []
        }
        
        for check in checks:
            try:
                # Check if notification already exists
                existing = supabase.table('notifications').select('id').eq('data->>ticket_check_id', check['id']).execute()
                
                if existing.data and len(existing.data) > 0:
                    results["skipped"] += 1
                    continue
                
                results["total_checks_processed"] += 1
                
                if check.get('is_win'):
                    create_win_notification(check)
                    results["win_notifications"] += 1
                elif notify_losses:
                    create_loss_notification(check)
                    results["loss_notifications"] += 1
                    
            except Exception as e:
                results["errors"].append({
                    "ticket_check_id": check.get('id'),
                    "error": str(e)
                })
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notifications: {str(e)}")

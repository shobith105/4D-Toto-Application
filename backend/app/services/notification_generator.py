"""
Notification service for creating user notifications based on ticket check results.
Compatible with BOTH old ticket_check.details format (list) and new format (dict with entries/winning_details/payout).
"""

from typing import Dict, Any, Tuple
from fastapi import HTTPException
from app.services.dbconfig import supabase
import re


# -------------------------
# Helpers
# -------------------------

def _parse_money(value: Any) -> int:
    """
    "$316,308" -> 316308, "-" -> 0, None -> 0
    """
    if value is None:
        return 0
    s = str(value).strip()
    if s == "" or s == "-":
        return 0
    return int(re.sub(r"[^\d]", "", s))


def _extract_win_info(ticket_check: Dict[str, Any], draw_payload: Dict[str, Any]) -> Tuple[int, int, Dict[str, Any]]:
    """
    Returns: (winning_combinations_count, total_payout, counts_by_group)

    Supports:
    - OLD: ticket_check["details"] is a list of winning combos
    - NEW: ticket_check["details"] is a dict with keys:
        - winning_details: list of winning combos
        - payout: { total_payout, counts_by_group }
    """
    details = ticket_check.get("details")

    # NEW format
    if isinstance(details, dict):
        winning_details = details.get("winning_details") or []
        payout = details.get("payout") or {}
        counts_by_group = payout.get("counts_by_group") or {}

        total_payout = payout.get("total_payout")
        if total_payout is None:
            # compute if missing
            prize_groups = (draw_payload or {}).get("prize_groups", {}) or {}
            total_payout = sum(_parse_money(prize_groups.get(f"group{d.get('prize_group')}")) for d in winning_details)

        return len(winning_details), int(total_payout), counts_by_group

    # OLD format
    if isinstance(details, list):
        prize_groups = (draw_payload or {}).get("prize_groups", {}) or {}
        total_payout = sum(_parse_money(prize_groups.get(f"group{d.get('prize_group')}")) for d in details)
        return len(details), int(total_payout), {}

    return 0, 0, {}


def _notification_exists(ticket_check_id: Any) -> bool:
    """
    Check if a notification already exists for this ticket_check.
    data->>ticket_check_id is stored as string in JSON.
    """
    check_id_str = str(ticket_check_id)
    existing = supabase.table("notifications").select("id").eq("data->>ticket_check_id", check_id_str).execute()
    return bool(existing.data)


# -------------------------
# Notification creators
# -------------------------

def create_win_notification(ticket_check: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a notification for a winning ticket check.
    """
    try:
        if _notification_exists(ticket_check["id"]):
            # return the existing id (optional)
            existing = supabase.table("notifications").select("*").eq("data->>ticket_check_id", str(ticket_check["id"])).single().execute()
            return existing.data or {}

        # Ticket
        ticket_response = supabase.table("tickets").select("*").eq("id", ticket_check["ticket_id"]).single().execute()
        if not ticket_response.data:
            raise ValueError(f"Ticket not found: {ticket_check['ticket_id']}")
        ticket = ticket_response.data
        user_id = ticket.get("user_id")
        game_type = (ticket.get("game_type") or "").upper()

        # Draw (IMPORTANT: ticket_check.draw_id is draw_results.uid )
        draw_response = supabase.table("draw_results").select("*").eq("uid", ticket_check["draw_id"]).single().execute()
        if not draw_response.data:
            raise ValueError(f"Draw not found: {ticket_check['draw_id']}")
        draw = draw_response.data
        draw_date = draw.get("draw_date")
        draw_no = draw.get("draw_no")
        draw_payload = draw.get("result", {}) or {}

        prize_group = ticket_check.get("highest_prize_group")

        winning_combinations, total_payout, counts_by_group = _extract_win_info(ticket_check, draw_payload)

        # Extract ticket numbers from entries
        ticket_details = ticket.get("details", {}) or {}
        ticket_numbers = []
        
        # Extract draw winning numbers
        draw_winning_numbers = {}
        
        if game_type == "TOTO":
            # TOTO: Extract user's ticket numbers
            toto_entries = ticket_details.get("toto_entries") or []
            if not toto_entries:
                # OLD format: single toto_entry
                toto_entry = ticket_details.get("toto_entry")
                if toto_entry:
                    toto_entries = [toto_entry]
            
            for entry in toto_entries:
                entry_nums = entry.get("numbers", [])
                if entry_nums:
                    label = entry.get("label", "")
                    ticket_numbers.append({
                        "label": label,
                        "numbers": sorted(entry_nums)
                    })
            
            # TOTO: Extract draw winning numbers
            draw_winning_numbers = {
                "winning_numbers": sorted(draw_payload.get("winning_numbers", [])),
                "additional_number": draw_payload.get("additional_number")
            }
            
        elif game_type == "4D":
            # 4D: Extract user's bet numbers
            fourd_bets = ticket_details.get("fourd_bets") or []
            for bet in fourd_bets:
                number = bet.get("number")
                bet_type = bet.get("bet_type") or bet.get("entry_type") or "Ordinary"
                if number:
                    ticket_numbers.append({
                        "number": number,
                        "bet_type": bet_type
                    })
            
            # 4D: Extract draw winning numbers
            top_prizes = draw_payload.get("top_prizes", {}) or {}
            draw_winning_numbers = {
                "first": top_prizes.get("first"),
                "second": top_prizes.get("second"),
                "third": top_prizes.get("third"),
                "starter": draw_payload.get("starter_prizes", []),
                "consolation": draw_payload.get("consolation_prizes", [])
            }
            
            # For 4D, also extract which numbers actually won and in what category
            check_details = ticket_check.get("details", {})
            bet_results = check_details.get("bet_results", [])
            winning_bets = []
            for bet_result in bet_results:
                if bet_result.get("best_category"):
                    wins = bet_result.get("wins", [])
                    for win in wins:
                        winning_bets.append({
                            "number": win.get("matched"),
                            "category": win.get("category"),
                            "payout": win.get("payout", 0)
                        })
            
            if winning_bets:
                draw_winning_numbers["your_matches"] = winning_bets

        # Extract winning combinations from ticket check details
        winning_combos = []
        check_details = ticket_check.get("details", {})
        if isinstance(check_details, dict):
            # NEW format: details is dict with winning_details array
            winning_details = check_details.get("winning_details", [])
            for detail in winning_details:
                winning_combos.append({
                    "combination": detail.get("combination", []),
                    "prize_group": detail.get("prize_group"),
                    "main_matches": detail.get("main_matches"),
                    "has_additional": detail.get("has_additional", False)
                })
        elif isinstance(check_details, list):
            # OLD format: details is list of winning combos
            for detail in check_details:
                winning_combos.append({
                    "combination": detail.get("combination", []),
                    "prize_group": detail.get("prize_group"),
                    "main_matches": detail.get("main_matches"),
                    "has_additional": detail.get("has_additional", False)
                })

        title = f"🎉 Congratulations! You Won {game_type}!"
        message = f"Your ticket has won Prize Group {prize_group} in the {game_type} Draw #{draw_no}!"
        if winning_combinations > 1:
            message += f" You have {winning_combinations} winning combinations!"
        if total_payout > 0:
            message += f" Total winnings: ${total_payout}."

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
                "total_payout": total_payout,
                "prize_amount": total_payout,  # Alias for frontend compatibility
                "counts_by_group": counts_by_group,
                "ticket_numbers": ticket_numbers,  # Your ticket numbers
                "draw_winning_numbers": draw_winning_numbers,  # Official draw winning numbers
                "winning_combos": winning_combos,  # User's winning combinations
                "ticket_id": ticket_check["ticket_id"],
                "ticket_check_id": str(ticket_check["id"]),
            },
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        response = supabase.table("notifications").insert(notification_data).execute()
        if not response.data:
            raise ValueError("Failed to create notification")
        return response.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create win notification: {str(e)}")


def create_loss_notification(ticket_check: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create a notification for a losing ticket check.
    """
    try:
        if _notification_exists(ticket_check["id"]):
            existing = supabase.table("notifications").select("*").eq("data->>ticket_check_id", str(ticket_check["id"])).single().execute()
            return existing.data or {}

        # Ticket
        ticket_response = supabase.table("tickets").select("*").eq("id", ticket_check["ticket_id"]).single().execute()
        if not ticket_response.data:
            raise ValueError(f"Ticket not found: {ticket_check['ticket_id']}")
        ticket = ticket_response.data
        user_id = ticket.get("user_id")
        game_type = (ticket.get("game_type") or "").upper()

        # Draw (use uid)
        draw_response = supabase.table("draw_results").select("*").eq("uid", ticket_check["draw_id"]).single().execute()
        if not draw_response.data:
            raise ValueError(f"Draw not found: {ticket_check['draw_id']}")
        draw = draw_response.data
        draw_date = draw.get("draw_date")
        draw_no = draw.get("draw_no")
        draw_payload = draw.get("result", {}) or {}

        # Extract ticket numbers from entries
        ticket_details = ticket.get("details", {}) or {}
        ticket_numbers = []
        
        # Extract draw winning numbers
        draw_winning_numbers = {}
        
        if game_type == "TOTO":
            # TOTO: Extract user's ticket numbers
            toto_entries = ticket_details.get("toto_entries") or []
            if not toto_entries:
                # OLD format: single toto_entry
                toto_entry = ticket_details.get("toto_entry")
                if toto_entry:
                    toto_entries = [toto_entry]
            
            for entry in toto_entries:
                entry_nums = entry.get("numbers", [])
                if entry_nums:
                    label = entry.get("label", "")
                    ticket_numbers.append({
                        "label": label,
                        "numbers": sorted(entry_nums)
                    })
            
            # TOTO: Extract draw winning numbers
            draw_winning_numbers = {
                "winning_numbers": sorted(draw_payload.get("winning_numbers", [])),
                "additional_number": draw_payload.get("additional_number")
            }
            
        elif game_type == "4D":
            # 4D: Extract user's bet numbers
            fourd_bets = ticket_details.get("fourd_bets") or []
            for bet in fourd_bets:
                number = bet.get("number")
                bet_type = bet.get("bet_type") or bet.get("entry_type") or "Ordinary"
                if number:
                    ticket_numbers.append({
                        "number": number,
                        "bet_type": bet_type
                    })
            
            # 4D: Extract draw winning numbers
            top_prizes = draw_payload.get("top_prizes", {}) or {}
            draw_winning_numbers = {
                "first": top_prizes.get("first"),
                "second": top_prizes.get("second"),
                "third": top_prizes.get("third"),
                "starter": draw_payload.get("starter_prizes", []),
                "consolation": draw_payload.get("consolation_prizes", [])
            }

        title = f"Draw Results: {game_type} Draw #{draw_no}"
        message = f"Your ticket for {game_type} Draw #{draw_no} did not win this time. Better luck next draw!"

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
                "ticket_numbers": ticket_numbers,  # Your ticket numbers
                "draw_winning_numbers": draw_winning_numbers,  # Official draw winning numbers
                "ticket_id": ticket_check["ticket_id"],
                "ticket_check_id": str(ticket_check["id"]),
            },
            "is_read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        response = supabase.table("notifications").insert(notification_data).execute()
        if not response.data:
            raise ValueError("Failed to create notification")
        return response.data[0]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create loss notification: {str(e)}")


# -------------------------
# Generators
# -------------------------

def generate_notifications_for_draw(draw_id: str, notify_losses: bool = False) -> Dict[str, Any]:
    """
    Generate notifications for all ticket checks of a specific draw.
    """
    try:
        checks_response = supabase.table("ticket_checks").select("*").eq("draw_id", draw_id).execute()
        checks = checks_response.data or []

        results = {
            "draw_id": draw_id,
            "total_checks": len(checks),
            "win_notifications": 0,
            "loss_notifications": 0,
            "errors": [],
        }

        for check in checks:
            try:
                if _notification_exists(check["id"]):
                    continue

                if check.get("is_win"):
                    create_win_notification(check)
                    results["win_notifications"] += 1
                elif notify_losses:
                    create_loss_notification(check)
                    results["loss_notifications"] += 1
            except Exception as e:
                results["errors"].append({"ticket_check_id": check.get("id"), "error": str(e)})

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notifications: {str(e)}")


def generate_notifications_for_all_checks(notify_losses: bool = False) -> Dict[str, Any]:
    """
    Generate notifications for all ticket checks that don't have notifications yet.
    Idempotent: checks if notification already exists before creating.
    """
    try:
        checks_response = supabase.table("ticket_checks").select("*").execute()
        checks = checks_response.data or []

        results = {
            "total_checks_processed": 0,
            "win_notifications": 0,
            "loss_notifications": 0,
            "skipped": 0,
            "errors": [],
        }

        for check in checks:
            try:
                if _notification_exists(check["id"]):
                    results["skipped"] += 1
                    continue

                results["total_checks_processed"] += 1

                if check.get("is_win"):
                    create_win_notification(check)
                    results["win_notifications"] += 1
                elif notify_losses:
                    create_loss_notification(check)
                    results["loss_notifications"] += 1

            except Exception as e:
                results["errors"].append({"ticket_check_id": check.get("id"), "error": str(e)})

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate notifications: {str(e)}")

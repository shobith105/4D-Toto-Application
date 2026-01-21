"""
Ticket checking service for BOTH TOTO + 4D draws.
Evaluates user tickets against official draw results and persists outcomes.
"""

from typing import Dict, Any
from fastapi import HTTPException

from app.services.dbconfig import supabase
from app.services.toto_checker import evaluate_toto_ticket
from app.services.fourd_checker import evaluate_4d_ticket


# -------------------------
# Draw processing: TOTO
# -------------------------

def check_tickets_for_draw(draw_id: str) -> Dict[str, Any]:
    """
    Check all TOTO tickets for a specific draw and persist results.
    IDEMPOTENT - safe to run multiple times.
    """
    try:
        draw_response = supabase.table("draw_results").select("*").eq("uid", draw_id).single().execute()
        if not draw_response.data:
            raise HTTPException(status_code=404, detail=f"Draw not found: {draw_id}")

        draw = draw_response.data
        game = str(draw.get("game") or "").lower()
        draw_date = draw.get("draw_date")
        draw_payload = draw.get("result", {}) or {}

        if game != "toto":
            raise HTTPException(status_code=400, detail=f"Unsupported game type: {draw.get('game')}")

        tickets_response = (
            supabase.table("tickets")
            .select("*")
            .eq("game_type", "TOTO")
            .eq("draw_date", draw_date)
            .execute()
        )
        tickets = tickets_response.data or []

        if not tickets:
            return {"draw_id": draw_id, "tickets_checked": 0, "wins": 0, "losses": 0, "message": "No tickets found for this draw"}

        results = {"tickets_checked": 0, "wins": 0, "losses": 0, "errors": []}

        for ticket in tickets:
            try:
                ticket_id = ticket.get("id")
                ticket_details = ticket.get("details", {}) or {}

                evaluation = evaluate_toto_ticket(ticket_details, draw_payload)

                ticket_check = {
                    "ticket_id": ticket_id,
                    "draw_id": draw_id,
                    "is_win": evaluation["is_win"],
                    "highest_prize_group": evaluation["highest_prize_group"],  # int group 1..7
                    "details": {
                        "entries": evaluation["entries"],
                        "winning_details": evaluation["winning_details"],
                        "payout": evaluation["payout"],
                    },
                }

                supabase.table("ticket_checks").upsert(ticket_check, on_conflict="ticket_id,draw_id").execute()

                results["tickets_checked"] += 1
                if evaluation["is_win"]:
                    results["wins"] += 1
                else:
                    results["losses"] += 1

            except Exception as e:
                results["errors"].append({"ticket_id": ticket.get("id"), "error": str(e)})

        return {"draw_id": draw_id, "game_type": "toto", "draw_date": draw_date, **results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TOTO ticket checking failed: {str(e)}")


# -------------------------
# Draw processing: 4D
# -------------------------

_FOURD_CATEGORY_TO_GROUP = {"first": 1, "second": 2, "third": 3, "starter": 4, "consolation": 5}

def check_4d_tickets_for_draw(draw_id: str) -> Dict[str, Any]:
    """
    Check all 4D tickets for a specific draw and persist results.
    IDEMPOTENT - safe to run multiple times.
    """
    try:
        draw_response = supabase.table("draw_results").select("*").eq("uid", draw_id).single().execute()
        if not draw_response.data:
            raise HTTPException(status_code=404, detail=f"Draw not found: {draw_id}")

        draw = draw_response.data
        game = str(draw.get("game") or "").lower()
        draw_date = draw.get("draw_date")
        draw_payload = draw.get("result", {}) or {}

        # accept "4d" or "4D" in draw.game
        if game != "4d":
            raise HTTPException(status_code=400, detail=f"Unsupported game type: {draw.get('game')}")

        tickets_response = (
            supabase.table("tickets")
            .select("*")
            .eq("game_type", "4D")
            .eq("draw_date", draw_date)
            .execute()
        )
        tickets = tickets_response.data or []

        if not tickets:
            return {"draw_id": draw_id, "tickets_checked": 0, "wins": 0, "losses": 0, "message": "No tickets found for this draw"}

        results = {"tickets_checked": 0, "wins": 0, "losses": 0, "errors": []}

        for ticket in tickets:
            try:
                ticket_id = ticket.get("id")
                ticket_details = ticket.get("details", {}) or {}

                evaluation = evaluate_4d_ticket(ticket_details, draw_payload)
                # evaluation: {is_win, highest_prize_category, total_payout, details:[...]}

                cat = evaluation.get("highest_prize_category")
                mapped_group = _FOURD_CATEGORY_TO_GROUP.get(cat) if cat else None

                ticket_check = {
                    "ticket_id": ticket_id,
                    "draw_id": draw_id,
                    "is_win": evaluation["is_win"],
                    # keep column usable even if it's integer typed in DB
                    "highest_prize_group": mapped_group,
                    "details": {
                        "highest_prize_category": cat,             # "first"/"second"/...
                        "payout": {"total_payout": evaluation.get("total_payout", 0)},
                        "bet_results": evaluation.get("details", []),
                    },
                }

                supabase.table("ticket_checks").upsert(ticket_check, on_conflict="ticket_id,draw_id").execute()

                results["tickets_checked"] += 1
                if evaluation["is_win"]:
                    results["wins"] += 1
                else:
                    results["losses"] += 1

            except Exception as e:
                results["errors"].append({"ticket_id": ticket.get("id"), "error": str(e)})

        return {"draw_id": draw_id, "game_type": "4d", "draw_date": draw_date, **results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"4D ticket checking failed: {str(e)}")


# -------------------------
# Batch processing (dispatcher)
# -------------------------

def check_all_unprocessed_draws() -> Dict[str, Any]:
    """
    Check all draws that have tickets but no ticket_checks yet.
    Supports both TOTO and 4D.
    """
    try:
        # Pull both games, dispatch by draw.game
        draws_response = supabase.table("draw_results").select("uid, game, draw_date").execute()
        draws = draws_response.data or []

        results = {
            "draws_processed": 0,
            "total_tickets_checked": 0,
            "total_wins": 0,
            "total_losses": 0,
            "draw_summaries": [],
        }

        for draw in draws:
            draw_id = draw.get("uid")
            game = str(draw.get("game") or "").lower()
            draw_date = draw.get("draw_date")

            if game not in ("toto", "4d"):
                continue

            ticket_game_type = "TOTO" if game == "toto" else "4D"
            run_checker = check_tickets_for_draw if game == "toto" else check_4d_tickets_for_draw

            existing_checks = supabase.table("ticket_checks").select("id", count="exact").eq("draw_id", draw_id).execute()
            tickets_count = (
                supabase.table("tickets")
                .select("id", count="exact")
                .eq("game_type", ticket_game_type)
                .eq("draw_date", draw_date)
                .execute()
            )

            tickets_total = tickets_count.count or 0
            checks_total = existing_checks.count or 0

            if tickets_total > 0 and checks_total < tickets_total:
                try:
                    draw_result = run_checker(draw_id)
                    results["draws_processed"] += 1
                    results["total_tickets_checked"] += draw_result.get("tickets_checked", 0)
                    results["total_wins"] += draw_result.get("wins", 0)
                    results["total_losses"] += draw_result.get("losses", 0)
                    results["draw_summaries"].append(draw_result)
                except Exception as e:
                    results["draw_summaries"].append({"draw_id": draw_id, "game": game, "error": str(e)})

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

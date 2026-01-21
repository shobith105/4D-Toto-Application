"""
Ticket checking service for TOTO draws.
Evaluates user tickets against official draw results and persists outcomes.
"""

from itertools import combinations
from typing import List, Dict, Any, Optional
from collections import Counter
import re

from app.services.dbconfig import supabase
from fastapi import HTTPException


# -------------------------
# Helpers
# -------------------------

def _to_int_list(xs) -> List[int]:
    """Defensively coerce list elements to int."""
    if not xs:
        return []
    out = []
    for x in xs:
        try:
            out.append(int(x))
        except Exception:
            pass
    return out


def _parse_money(value: Any) -> int:
    """
    Converts "$316,308" -> 316308, "-" -> 0, None -> 0.
    """
    if value is None:
        return 0
    s = str(value).strip()
    if s == "-" or s == "":
        return 0
    return int(re.sub(r"[^\d]", "", s))


def compute_total_payout(winning_details: List[Dict[str, Any]], prize_groups: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sum payout per winning combination, based on draw_payload["prize_groups"]["groupX"].
    Returns total + counts per group.
    """
    counts = Counter(d["prize_group"] for d in winning_details)
    total = 0
    for d in winning_details:
        key = f"group{d['prize_group']}"
        total += _parse_money(prize_groups.get(key))
    return {
        "total_payout": total,
        "counts_by_group": dict(counts),
    }


def extract_toto_entries(ticket_details: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Supports both:
      - new format: ticket_details["toto_entries"] = [ ... ]
      - old format: ticket_details["toto_entry"] = { ... }
    Returns list of entry dicts.
    """
    entries = ticket_details.get("toto_entries")
    if isinstance(entries, list) and entries:
        return entries

    old = ticket_details.get("toto_entry")
    if isinstance(old, dict) and old:
        return [old]

    return []


# -------------------------
# TOTO evaluation
# -------------------------

def generate_combinations(numbers: List[int]) -> List[List[int]]:
    """
    Generate all 6-number combinations from a TOTO entry.
    - If exactly 6 numbers: 1 combination
    - If >6 numbers: all nC6 combinations
    """
    nums = sorted(set(_to_int_list(numbers)))
    if len(nums) < 6:
        raise ValueError("Invalid TOTO entry: must have at least 6 unique numbers")

    if len(nums) == 6:
        return [nums]

    return [list(combo) for combo in combinations(nums, 6)]


def evaluate_toto_combination(
    combination: List[int],
    winning_numbers: List[int],
    additional_number: int
) -> Optional[Dict[str, Any]]:
    """
    Evaluate a single 6-number combination against draw results.
    """
    combo_set = set(combination)
    win_set = set(winning_numbers)

    main_matches = len(combo_set & win_set)

    # In SG Pools TOTO, Additional is a separate number; treat it as "matched"
    # if it appears in the combination.
    has_additional = additional_number in combo_set

    prize_group = None
    if main_matches == 6:
        prize_group = 1
    elif main_matches == 5 and has_additional:
        prize_group = 2
    elif main_matches == 5:
        prize_group = 3
    elif main_matches == 4 and has_additional:
        prize_group = 4
    elif main_matches == 4:
        prize_group = 5
    elif main_matches == 3 and has_additional:
        prize_group = 6
    elif main_matches == 3:
        prize_group = 7

    if prize_group is None:
        return None

    return {
        "combination": sorted(combination),
        "prize_group": prize_group,
        "main_matches": main_matches,
        "has_additional": has_additional
    }


def evaluate_toto_entry(
    entry: Dict[str, Any],
    draw_payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate ONE TOTO entry (A/B/...) against the draw.
    Returns per-entry evaluation details.
    """
    bet_type = entry.get("bet_type")
    label = entry.get("label")

    winning_numbers = _to_int_list(draw_payload.get("winning_numbers", []))
    additional_number = draw_payload.get("additional_number")

    if len(winning_numbers) != 6:
        raise ValueError("Invalid draw: must have exactly 6 winning numbers")
    if additional_number is None:
        raise ValueError("Invalid draw: missing additional number")

    # Only supports Ordinary/System (numbers list) for now
    numbers = _to_int_list(entry.get("numbers", []))

    if bet_type == "SystemRoll":
        # You can implement SystemRoll expansion later.
        raise ValueError("SystemRoll checking not implemented yet")

    # Ordinary/System both can be evaluated by combination expansion
    combos = generate_combinations(numbers)

    winning_details = []
    for combo in combos:
        r = evaluate_toto_combination(combo, winning_numbers, int(additional_number))
        if r:
            winning_details.append(r)

    if not winning_details:
        return {
            "label": label,
            "bet_type": bet_type,
            "numbers": numbers,
            "is_win": False,
            "highest_prize_group": None,
            "details": []
        }

    highest_prize_group = min(d["prize_group"] for d in winning_details)
    return {
        "label": label,
        "bet_type": bet_type,
        "numbers": numbers,
        "is_win": True,
        "highest_prize_group": highest_prize_group,
        "details": winning_details
    }


def evaluate_toto_ticket_multi(
    ticket_details: Dict[str, Any],
    draw_payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate a ticket that may contain multiple TOTO entries.
    Returns aggregated ticket-level result + per-entry results.
    """
    entries = extract_toto_entries(ticket_details)
    if not entries:
        raise ValueError("No TOTO entries found in ticket details")

    per_entry_results = []
    all_winning_details = []

    for entry in entries:
        res = evaluate_toto_entry(entry, draw_payload)
        per_entry_results.append(res)
        all_winning_details.extend(res["details"])

    if not all_winning_details:
        return {
            "is_win": False,
            "highest_prize_group": None,
            "entries": per_entry_results,
            "winning_details": [],
            "payout": {"total_payout": 0, "counts_by_group": {}},
        }

    highest_prize_group = min(d["prize_group"] for d in all_winning_details)
    payout = compute_total_payout(all_winning_details, draw_payload.get("prize_groups", {}))

    return {
        "is_win": True,
        "highest_prize_group": highest_prize_group,
        "entries": per_entry_results,
        "winning_details": all_winning_details,
        "payout": payout,
    }


# -------------------------
# Draw processing
# -------------------------

def check_tickets_for_draw(draw_id: str) -> Dict[str, Any]:
    """
    Check all tickets for a specific draw and persist results.
    IDEMPOTENT - safe to run multiple times.
    """
    try:
        draw_response = supabase.table('draw_results').select('*').eq('uid', draw_id).single().execute()
        if not draw_response.data:
            raise HTTPException(status_code=404, detail=f"Draw not found: {draw_id}")

        draw = draw_response.data
        game_type = draw.get('game')
        draw_date = draw.get('draw_date')
        draw_payload = draw.get('result', {})

        if game_type != 'toto':
            raise HTTPException(status_code=400, detail=f"Unsupported game type: {game_type}")

        tickets_response = supabase.table('tickets').select('*').eq('game_type', 'TOTO').eq('draw_date', draw_date).execute()
        tickets = tickets_response.data or []

        if not tickets:
            return {
                "draw_id": draw_id,
                "tickets_checked": 0,
                "wins": 0,
                "losses": 0,
                "message": "No tickets found for this draw"
            }

        results = {
            "tickets_checked": 0,
            "wins": 0,
            "losses": 0,
            "errors": []
        }

        for ticket in tickets:
            try:
                ticket_id = ticket.get('id')
                ticket_details = ticket.get('details', {})

                evaluation = evaluate_toto_ticket_multi(ticket_details, draw_payload)

                # Keep DB fields the same; store richer info inside details JSON.
                ticket_check = {
                    "ticket_id": ticket_id,
                    "draw_id": draw_id,
                    "is_win": evaluation["is_win"],
                    "highest_prize_group": evaluation["highest_prize_group"],
                    "details": {
                        "entries": evaluation["entries"],                 # per A/B entry
                        "winning_details": evaluation["winning_details"], # flattened combos
                        "payout": evaluation["payout"],                   # total + group counts
                    }
                }

                supabase.table('ticket_checks').upsert(
                    ticket_check,
                    on_conflict="ticket_id,draw_id"
                ).execute()

                results["tickets_checked"] += 1
                if evaluation["is_win"]:
                    results["wins"] += 1
                else:
                    results["losses"] += 1

            except Exception as e:
                results["errors"].append({
                    "ticket_id": ticket.get('id'),
                    "error": str(e)
                })

        return {
            "draw_id": draw_id,
            "game_type": game_type,
            "draw_date": draw_date,
            **results
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ticket checking failed: {str(e)}")


def check_all_unprocessed_draws() -> Dict[str, Any]:
    """
    Check all draws that have tickets but no ticket_checks yet.
    One row per ticket per draw.
    """
    try:
        draws_response = supabase.table('draw_results').select('uid, game, draw_date').eq('game', 'toto').execute()
        draws = draws_response.data or []

        results = {
            "draws_processed": 0,
            "total_tickets_checked": 0,
            "total_wins": 0,
            "total_losses": 0,
            "draw_summaries": []
        }

        for draw in draws:
            draw_id = draw.get('uid')

            existing_checks = supabase.table('ticket_checks').select('id', count='exact').eq('draw_id', draw_id).execute()
            tickets_count = supabase.table('tickets').select('id', count='exact').eq('game_type', 'TOTO').eq('draw_date', draw.get('draw_date')).execute()

            tickets_total = tickets_count.count or 0
            checks_total = existing_checks.count or 0

            if tickets_total > 0 and checks_total < tickets_total:
                try:
                    draw_result = check_tickets_for_draw(draw_id)
                    results["draws_processed"] += 1
                    results["total_tickets_checked"] += draw_result.get("tickets_checked", 0)
                    results["total_wins"] += draw_result.get("wins", 0)
                    results["total_losses"] += draw_result.get("losses", 0)
                    results["draw_summaries"].append(draw_result)
                except Exception as e:
                    results["draw_summaries"].append({
                        "draw_id": draw_id,
                        "error": str(e)
                    })

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing failed: {str(e)}")

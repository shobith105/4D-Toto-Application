"""
TOTO ticket evaluation logic.
Evaluates TOTO tickets against official draw results.
"""

from itertools import combinations
from typing import List, Dict, Any, Optional
from collections import Counter
import re


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
    """Converts '$316,308' -> 316308, '-' -> 0, None -> 0."""
    if value is None:
        return 0
    s = str(value).strip()
    if s == "-" or s == "":
        return 0
    return int(re.sub(r"[^\d]", "", s))


def compute_total_payout(winning_details: List[Dict[str, Any]], prize_groups: Dict[str, Any]) -> Dict[str, Any]:
    """Sum payout per winning combination, based on draw_payload['prize_groups']['groupX']."""
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
      - new format: ticket_details['toto_entries'] = [ ... ]
      - old format: ticket_details['toto_entry'] = { ... }
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
    """Evaluate a single 6-number combination against draw results."""
    combo_set = set(combination)
    win_set = set(winning_numbers)

    main_matches = len(combo_set & win_set)
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


def evaluate_toto_entry(entry: Dict[str, Any], draw_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate ONE TOTO entry (A/B/...) against the draw."""
    bet_type = entry.get("bet_type")
    label = entry.get("label")

    winning_numbers = _to_int_list(draw_payload.get("winning_numbers", []))
    additional_number = draw_payload.get("additional_number")

    if len(winning_numbers) != 6:
        raise ValueError("Invalid draw: must have exactly 6 winning numbers")
    if additional_number is None:
        raise ValueError("Invalid draw: missing additional number")

    numbers = _to_int_list(entry.get("numbers", []))

    if bet_type == "SystemRoll":
        raise ValueError("SystemRoll checking not implemented yet")

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


def evaluate_toto_ticket(ticket_details: Dict[str, Any], draw_payload: Dict[str, Any]) -> Dict[str, Any]:
    """Evaluate a ticket that may contain multiple TOTO entries."""
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

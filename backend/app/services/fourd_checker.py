from itertools import permutations
from typing import Dict, Any, List, Optional

# ---------- Payout tables (per $1 stake) ----------
PAYOUT_STD_BIG = {"first": 2000, "second": 1000, "third": 490, "starter": 250, "consolation": 60}
PAYOUT_STD_SMALL = {"first": 3000, "second": 2000, "third": 800}

PAYOUT_IBET_BIG = {
    "4diff": {"first": 83,  "second": 41,  "third": 20,  "starter": 10, "consolation": 3},
    "2same": {"first": 166, "second": 83,  "third": 40,  "starter": 20, "consolation": 6},
    "2pairs":{"first": 335, "second": 168, "third": 85,  "starter": 41, "consolation": 10},
    "3same": {"first": 500, "second": 250, "third": 127, "starter": 62, "consolation": 15},
}
PAYOUT_IBET_SMALL = {
    "4diff": {"first": 125, "second": 83,  "third": 33},
    "2same": {"first": 250, "second": 167, "third": 66},
    "2pairs":{"first": 500, "second": 333, "third": 133},
    "3same": {"first": 750, "second": 500, "third": 200},
}

PRIZE_RANK = {"first": 1, "second": 2, "third": 3, "starter": 4, "consolation": 5}


# ---------- Helpers ----------
def _is_4d(num: str) -> bool:
    return isinstance(num, str) and len(num) == 4 and num.isdigit()

def _classify_pattern(num4: str) -> str:
    # for iBet tables: 4diff, 2same, 2pairs, 3same
    freq = sorted((num4.count(d) for d in set(num4)), reverse=True)
    if freq == [1, 1, 1, 1]: return "4diff"
    if freq == [2, 1, 1]:    return "2same"
    if freq == [2, 2]:       return "2pairs"
    if freq == [3, 1]:       return "3same"
    return "allsame"  # e.g. "1111" (edge case)


def _expand_covered_numbers(bet: Dict[str, Any]) -> List[str]:
    # Support both 'entry_type' and 'bet_type' field names
    # Default to 'Ordinary' if neither is specified
    et = bet.get("entry_type") or bet.get("bet_type") or "Ordinary"

    if et in ("Ordinary", "System", "iBet"):
        base = bet.get("number")
        if not _is_4d(base):
            raise ValueError(f"{et} requires a 4-digit string number")
        if et == "Ordinary":
            return [base]
        return sorted({ "".join(p) for p in permutations(base, 4) })

    if et == "Roll":
        rp = (bet.get("roll_pattern") or "").strip().upper()
        if len(rp) != 4 or rp.count("X") != 1 or any(c != "X" and not c.isdigit() for c in rp):
            raise ValueError("Roll requires roll_pattern like '58X2' (4 chars, exactly one X)")
        i = rp.index("X")
        covered = [rp[:i] + str(d) + rp[i+1:] for d in range(10)]
        # covered are already 4-digit strings (can start with '0')
        return covered

    raise ValueError(f"Unknown entry_type: {et}")


def _build_draw_index(draw_payload: Dict[str, Any]) -> Dict[str, str]:
    """
    Parse 4D draw results from scraper format:
    {
      "top_prizes": {"first": "1234", "second": "5678", "third": "9012"},
      "starter_prizes": ["....10...."],
      "consolation_prizes": ["....10...."]
    }
    """
    top_prizes = draw_payload.get("top_prizes") or {}
    first = top_prizes.get("first")
    second = top_prizes.get("second")
    third = top_prizes.get("third")
    starter = draw_payload.get("starter_prizes") or []
    consolation = draw_payload.get("consolation_prizes") or []

    if not (_is_4d(first) and _is_4d(second) and _is_4d(third)):
        raise ValueError("Invalid 4D draw: first/second/third must be 4-digit strings")
    if any(not _is_4d(x) for x in starter) or any(not _is_4d(x) for x in consolation):
        raise ValueError("Invalid 4D draw: starter/consolation must be lists of 4-digit strings")

    idx: Dict[str, str] = {first: "first", second: "second", third: "third"}
    for x in starter: idx[x] = "starter"
    for x in consolation: idx[x] = "consolation"
    return idx


# ---------- Core evaluation ----------
def evaluate_4d_bet(bet: Dict[str, Any], draw_index: Dict[str, str]) -> Dict[str, Any]:
    covered = _expand_covered_numbers(bet)

    big = float(bet.get("big_amount") or 0.0)
    small = float(bet.get("small_amount") or 0.0)

    # Support both 'entry_type' and 'bet_type' field names, default to 'Ordinary'
    et = bet.get("entry_type") or bet.get("bet_type") or "Ordinary"
    pattern_key = _classify_pattern(bet["number"]) if et == "iBet" else None

    wins: List[Dict[str, Any]] = []
    total = 0.0
    best_rank: Optional[int] = None

    for n in covered:
        cat = draw_index.get(n)
        if not cat:
            continue

        best_rank = min(best_rank or 999, PRIZE_RANK[cat])

        if big > 0:
            mult = (PAYOUT_IBET_BIG.get(pattern_key, {}).get(cat) if et == "iBet" else PAYOUT_STD_BIG.get(cat))
            if mult is not None:
                amt = big * mult
                total += amt
                wins.append({"matched": n, "category": cat, "stake_type": "big", "stake": big, "mult": mult, "payout": amt})

        if small > 0:
            mult = (PAYOUT_IBET_SMALL.get(pattern_key, {}).get(cat) if et == "iBet" else PAYOUT_STD_SMALL.get(cat))
            if mult is not None:
                amt = small * mult
                total += amt
                wins.append({"matched": n, "category": cat, "stake_type": "small", "stake": small, "mult": mult, "payout": amt})

    best_category = None
    if best_rank is not None:
        best_category = min(PRIZE_RANK.keys(), key=lambda k: PRIZE_RANK[k] if PRIZE_RANK[k] == best_rank else 999)

    return {
        "label": bet.get("label") or bet.get("number", "?"),  # fallback to number if no label
        "entry_type": et,
        "base": bet.get("number") or bet.get("roll_pattern"),
        "covered_count": len(covered),
        "best_category": best_category,
        "payout": round(total, 2),
        "wins": wins,  # keep for debugging/notifications detail
    }


def evaluate_4d_ticket(ticket_details: Dict[str, Any], draw_payload: Dict[str, Any]) -> Dict[str, Any]:
    bets = ticket_details.get("fourd_bets") or []
    if not bets:
        raise ValueError("Invalid 4D ticket: missing fourd_bets")

    draw_index = _build_draw_index(draw_payload)

    bet_results = []
    total = 0.0
    best_rank: Optional[int] = None

    for bet in bets:
        r = evaluate_4d_bet(bet, draw_index)
        bet_results.append(r)
        total += r["payout"]
        if r["best_category"]:
            best_rank = min(best_rank or 999, PRIZE_RANK[r["best_category"]])

    highest_category = None
    if best_rank is not None:
        highest_category = min(PRIZE_RANK.keys(), key=lambda k: PRIZE_RANK[k] if PRIZE_RANK[k] == best_rank else 999)

    return {
        "is_win": total > 0,
        "highest_prize_category": highest_category,  # first/second/third/starter/consolation
        "total_payout": round(total, 2),
        "details": bet_results,
    }

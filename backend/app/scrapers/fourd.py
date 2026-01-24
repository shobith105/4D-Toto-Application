import os
import base64
import re
from datetime import datetime, timezone
import requests
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from supabase import create_client


UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

BASE_4D_URL = "https://www.singaporepools.com.sg/en/product/pages/4d_results.aspx"
load_dotenv()
url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(url, key)


def make_sppl(draw_no: int) -> str:
    """
    Build the Singapore Pools `sppl` query parameter for a given draw number.

    The `sppl` parameter is standard base64 encoding of the ASCII string:
      "DrawNumber=<draw_no>"

    Args:
        draw_no: 4D draw number.

    Returns:
        Base64-encoded `sppl` string suitable for the URL query parameter.
    """
    raw = f"DrawNumber={draw_no}".encode("utf-8")
    return base64.b64encode(raw).decode("ascii")


def fetch_html(url: str) -> str:
    """
    Fetch a web page and return its HTML as text.

    Args:
        url: Fully-qualified URL.

    Returns:
        HTML response body.

    Raises:
        requests.HTTPError / requests.RequestException on failure.
    """
    r = requests.get(url, headers={"User-Agent": UA}, timeout=20)
    r.raise_for_status()
    return r.text

def parse_4d_tables_wrap(html: str) -> dict:
    """
    Parse Singapore Pools 4D results from the <div class="tables-wrap"> container.

    Expected structure inside `div.tables-wrap`:
      1) Header table (orange-header) containing draw date + draw number
      2) Top prizes table containing 1st/2nd/3rd prizes
      3) Starter prizes table with tbody class="tbodyStarterPrizes"
      4) Consolation prizes table with tbody class="tbodyConsolationPrizes"

    Returns:
        {
          "game": "4d",
          "draw_no": int,
          "draw_date": str|None,
          "top_prizes": {"first": "####", "second": "####", "third": "####"},
          "starter_prizes": [ "####", ... ],
          "consolation_prizes": [ "####", ... ],
        }

    Raises:
        ValueError: If required elements are missing (page layout changed or not released).
    """
    soup = BeautifulSoup(html, "html.parser")
    wrap = soup.select_one("div.tables-wrap")
    if not wrap:
        raise ValueError("Missing div.tables-wrap")

    # --- Extract draw date and draw number from header ---
    draw_date_el = wrap.select_one("th.drawDate")
    draw_no_el = wrap.select_one("th.drawNumber")

    draw_date = draw_date_el.get_text(" ", strip=True) if draw_date_el else None
    draw_no_text = draw_no_el.get_text(" ", strip=True) if draw_no_el else ""
    m = re.search(r"(\d+)", draw_no_text)
    if not m:
        raise ValueError("Could not parse draw number")
    draw_no = int(m.group(1))

    def cell_4d(el) -> str | None:
        t = el.get_text(" ", strip=True)
        m2 = re.search(r"\b(\d{4})\b", t)
        return m2.group(1) if m2 else None

    # --- Table 1: top prizes (contains tdFirstPrize, tdSecondPrize, tdThirdPrize) ---
    top_prizes = {}
    first_prize = wrap.select_one("td.tdFirstPrize")
    second_prize = wrap.select_one("td.tdSecondPrize")
    third_prize = wrap.select_one("td.tdThirdPrize")

    if first_prize:
        num = cell_4d(first_prize)
        if num:
            top_prizes["first"] = num
    
    if second_prize:
        num = cell_4d(second_prize)
        if num:
            top_prizes["second"] = num
    
    if third_prize:
        num = cell_4d(third_prize)
        if num:
            top_prizes["third"] = num

    # --- Table 2: starter prizes ---
    starter = []
    starter_tbody = wrap.select_one("tbody.tbodyStarterPrizes")
    if starter_tbody:
        for tr in starter_tbody.select("tr"):
            for td in tr.find_all("td"):
                num = cell_4d(td)
                if num:
                    starter.append(num)

    # --- Table 3: consolation prizes ---
    consolation = []
    consolation_tbody = wrap.select_one("tbody.tbodyConsolationPrizes")
    if consolation_tbody:
        for tr in consolation_tbody.select("tr"):
            for td in tr.find_all("td"):
                num = cell_4d(td)
                if num:
                    consolation.append(num)

    return {
        "game": "4d",
        "draw_no": draw_no,
        "draw_date": draw_date,
        "top_prizes": top_prizes,
        "starter_prizes": starter,
        "consolation_prizes": consolation,
    }



def is_released_4d(parsed: dict) -> bool:
    """
    Decide whether a parsed 4D page looks like a fully released draw result.

    This helps when checking draw_no+1: pages may exist before final data appears.

    Args:
        parsed: Output of parse_4d_tables_wrap().

    Returns:
        True if 1st/2nd/3rd prizes exist and starter/consolation lists are non-empty.
    """
    top = parsed.get("top_prizes", {}) or {}
    return (
        all(k in top for k in ("first", "second", "third"))
        and len(parsed.get("starter_prizes", []) or []) > 0
        and len(parsed.get("consolation_prizes", []) or []) > 0
    )


def get_latest_draw_no() -> int:
    """
    Fetch the latest draw number from Supabase for 4D game.

    Returns:
        Latest draw_no + 1, or a default starting number if no draws exist.

    Raises:
        RuntimeError if Supabase query fails.
    """
    result = (
        supabase.table("draw_results")
        .select("draw_no")
        .eq("game", "4d")
        .order("draw_no", desc=True)
        .limit(1)
        .execute()
    )

    if result.data and len(result.data) > 0:
        latest_draw = result.data[0]["draw_no"]
        print(f"[INFO] Latest draw in DB: {latest_draw}")
        return latest_draw +1
    else:
        # No draws found, start with a default number
        print("[INFO] No draws found in DB, using default starting draw number")
        return 5431


def upsert_draw_result(payload: dict) -> bool:
    """
    Insert a new draw result row into Supabase if it does not already exist.

    Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env vars.
    Assumes a `draw_results` table with unique(game, draw_no).

    Args:
        payload: Parsed result dict (from parse_4d_tables_wrap).

    Returns:
        True if inserted (new draw), False if already exists.

    Raises:
        RuntimeError if insertion fails unexpectedly.
    """
    

    game = payload["game"]
    draw_no = payload["draw_no"]

    existing = (
        supabase.table("draw_results")
        .select("uid")
        .eq("game", game)
        .eq("draw_no", draw_no)
        .limit(1)
        .execute()
    )
    if existing.data:
        print(f"[OK] {game} draw {draw_no} already exists.")
        return False

    row = {
        "game": game,
        "draw_no": draw_no,
        "draw_date": payload.get("draw_date"),
        "result": {
            "top_prizes": payload.get("top_prizes", []),
            "starter_prizes": payload.get("starter_prizes", []),
            "consolation_prizes": payload.get("consolation_prizes", []),
        }
        
    }

    res = supabase.table("draw_results").insert(row).execute()
    if not res.data:
        raise RuntimeError("Insert failed (no data returned).")

    print(f"[NEW] Inserted {game} draw {draw_no}.")
    return True


def main():
    # Fetch the next draw number to check
    draw_no = get_latest_draw_no()
    print(f"[INFO] Checking for draw number: {draw_no}")
    
    sppl = make_sppl(draw_no)
    url = f"{BASE_4D_URL}?sppl={sppl}"

    html = fetch_html(url)
    parsed = parse_4d_tables_wrap(html)

    # Add debug output to see what was parsed
    print(f"[DEBUG] Parsed data: {parsed}")
    print(f"[DEBUG] Top prizes: {parsed.get('top_prizes')}")
    print(f"[DEBUG] Starter prizes count: {len(parsed.get('starter_prizes', []))}")
    print(f"[DEBUG] Consolation prizes count: {len(parsed.get('consolation_prizes', []))}")
    print(f"[DEBUG] is_released_4d result: {is_released_4d(parsed)}")

    if not is_released_4d(parsed):
        print(f"[WAIT] Draw {parsed['draw_no']} not fully released yet.")
        return

    upsert_draw_result(parsed)


if __name__ == "__main__":
    main()

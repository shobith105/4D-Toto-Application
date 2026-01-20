import os
import base64
import re
from datetime import datetime, timezone
import requests
from bs4 import BeautifulSoup
from supabase import create_client
from dotenv import load_dotenv


UA = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

BASE_TOTO_URL = "https://www.singaporepools.com.sg/en/product/pages/toto_results.aspx"

load_dotenv()
url = os.environ["SUPABASE_URL"]
key = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
supabase = create_client(url, key)

def make_sppl(draw_no: int) -> str:
    """
    Build the Singapore Pools `sppl` query parameter for a given draw number.

    Args:
        draw_no: TOTO draw number.

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


def parse_toto_tables_wrap(html: str) -> dict:
    """
    Parse Singapore Pools TOTO results from the <div class="tables-wrap"> container.

    Expected structure:
      1) Draw date and draw number in header
      2) Winning Numbers section (6 numbers)
      3) Additional Number section (1 number)
      4) Winning Shares table (Group 1-7 with share amounts)

    Returns:
        {
          "game": "toto",
          "draw_no": int,
          "draw_date": str|None,
          "winning_numbers": [x, y, z, ...],
          "additional_number": "#",
          "prize_groups": {
            "group1": "###",
            "group2": "###",
            "group3": "###",
            "group4": "###",
            "group5": "###",
            "group6": "###",
            "group7": "###"
          }
        }

    Raises:
        ValueError: If required elements are missing.
    """
    soup = BeautifulSoup(html, "html.parser")
    wrap = soup.select_one("div.tables-wrap")
    if not wrap:
        raise ValueError("Missing div.tables-wrap")

    # --- Extract draw date and draw number ---
    draw_date_text = None
    draw_no = None
    
    # Look for the header table with draw date and number
    header_table = wrap.select_one("table")
    if header_table:
        cells = header_table.select("td, th")
        for cell in cells:
            text = cell.get_text(" ", strip=True)
            # Draw date pattern: "Mon, 19 Jan 2026"
            if re.search(r"\w+,\s+\d+\s+\w+\s+\d{4}", text):
                draw_date_text = text
            # Draw number pattern: "Draw No. 4149"
            m = re.search(r"Draw\s+No\.\s+(\d+)", text, re.IGNORECASE)
            if m:
                draw_no = int(m.group(1))

    if not draw_no:
        raise ValueError("Could not parse draw number")

    # --- Extract Winning Numbers (6 main numbers) ---
    winning_numbers = []
    winning_section = None
    
    # Find the section with "Winning Numbers" header
    for table in wrap.select("table"):
        header_text = table.get_text(" ", strip=True)
        if "Winning Numbers" in header_text:
            winning_section = table
            break
    
    if winning_section:
        for td in winning_section.select("td"):
            text = td.get_text(" ", strip=True)
            if text.isdigit() and len(text) <= 2:
                winning_numbers.append(text)

    # --- Extract Additional Number ---
    additional_number = None
    additional_section = None
    
    for table in wrap.select("table"):
        header_text = table.get_text(" ", strip=True)
        if "Additional Number" in header_text:
            additional_section = table
            break
    
    if additional_section:
        for td in additional_section.select("td"):
            text = td.get_text(" ", strip=True)
            if text.isdigit() and len(text) <= 2:
                additional_number = text
                break

    # --- Extract Winning Shares (Prize amounts for each group) ---
    prize_groups = {}
    shares_table = None
    
    for table in wrap.select("table"):
        header_text = table.get_text(" ", strip=True)
        if "Winning Shares" in header_text:
            shares_table = table
            break
    
    if shares_table:
        rows = shares_table.select("tr")
        for row in rows:
            cells = row.select("td")
            if len(cells) >= 2:
                group_text = cells[0].get_text(" ", strip=True).lower()
                amount_text = cells[1].get_text(" ", strip=True)
                
                # Extract group number
                m = re.search(r"group\s*(\d+)", group_text, re.IGNORECASE)
                if m:
                    group_num = m.group(1)
                    prize_groups[f"group{group_num}"] = amount_text

    return {
        "game": "toto",
        "draw_no": draw_no,
        "draw_date": draw_date_text,
        "winning_numbers": winning_numbers,
        "additional_number": additional_number,
        "prize_groups": prize_groups,
    }


def is_released_toto(parsed: dict) -> bool:
    """
    Decide whether a parsed TOTO page looks like a fully released draw result.

    Args:
        parsed: Output of parse_toto_tables_wrap().

    Returns:
        True if winning numbers exist and prize groups are populated.
    """
    return (
        len(parsed.get("winning_numbers", []) or []) == 6
        and parsed.get("additional_number") is not None
        and len(parsed.get("prize_groups", {}) or {}) > 0
    )


def get_latest_draw_no() -> int:
    """
    Fetch the latest draw number from Supabase for TOTO game.

    Returns:
        Latest draw_no + 1, or a default starting number if no draws exist.
    """
    result = (
        supabase.table("draw_results")
        .select("draw_no")
        .eq("game", "toto")
        .order("draw_no", desc=True)
        .limit(1)
        .execute()
    )

    if result.data and len(result.data) > 0:
        latest_draw = result.data[0]["draw_no"]
        print(f"[INFO] Latest TOTO draw in DB: {latest_draw}")
        return latest_draw + 1
    else:
        print("[INFO] No TOTO draws found in DB, using default starting draw number")
        return 3866 


def upsert_draw_result(payload: dict) -> bool:
    """
    Insert a new TOTO draw result into Supabase if it doesn't exist.

    Args:
        payload: Parsed result dict.
        
    Returns:
        True if inserted, False if already exists.
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
            "winning_numbers": payload.get("winning_numbers"),
            "additional_number": payload.get("additional_number"),
            "prize_groups": payload.get("prize_groups"),
        }
    }

    res = supabase.table("draw_results").insert(row).execute()
    if not res.data:
        raise RuntimeError("Insert failed (no data returned).")

    print(f"[NEW] Inserted {game} draw {draw_no}.")
    return True


def main():
    draw_no = get_latest_draw_no()
    print(f"[INFO] Checking for TOTO draw number: {draw_no}")
    
    sppl = make_sppl(draw_no)
    url = f"{BASE_TOTO_URL}?sppl={sppl}"

    html = fetch_html(url)
    parsed = parse_toto_tables_wrap(html)

    if not is_released_toto(parsed):
        print(f"[WAIT] TOTO draw {parsed['draw_no']} not fully released yet.")
        return

    upsert_draw_result(parsed)


if __name__ == "__main__":
    main()
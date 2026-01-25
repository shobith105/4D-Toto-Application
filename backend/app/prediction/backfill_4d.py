import time
from app.scrapers.fourd import main, get_latest_draw_no, upsert_draw_result, fetch_html, parse_4d_tables_wrap, make_sppl, BASE_4D_URL



def run_backfill():
    # Start from a known draw in 2024 to get enough history
    start_draw = 5200 
    end_draw = 5300 # Fetch 100 draws
    
    print(f"Starting 4D Backfill from {start_draw} to {end_draw}...")
    
    for draw_no in range(start_draw, end_draw + 1):
        try:
            print(f"Fetching Draw {draw_no}...")
            sppl = make_sppl(draw_no)
            url = f"{BASE_4D_URL}?sppl={sppl}"
            html = fetch_html(url)
            parsed = parse_4d_tables_wrap(html)
            
            upsert_draw_result(parsed)
            time.sleep(1) # Trying not to overload the server
        except Exception as e:
            print(f"Skipped {draw_no}: {e}")

if __name__ == "__main__":
    run_backfill()
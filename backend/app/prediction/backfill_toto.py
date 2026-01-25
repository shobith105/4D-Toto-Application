import time
# Assumes your scraper file is named 'toto.py' inside 'app/scrapers/'
from app.scrapers.toto import (
    make_sppl, 
    fetch_html, 
    parse_toto_tables_wrap, 
    upsert_draw_result, 
    BASE_TOTO_URL,
    is_released_toto
)

def run_backfill():
    # TOTO draws happen twice a week (~104 draws/year).
    # Latest draw is 4150 as of working on this
    # We will fetch the last ~100 draws (approx 1 year of data).
    
    start_draw = 4050 
    end_draw = 4150
    
    print(f"--- Starting TOTO Backfill: Draws {start_draw} to {end_draw} ---")
    
    success_count = 0
    
    for draw_no in range(start_draw, end_draw + 1):
        try:
            print(f"[FETCH] Draw {draw_no}...", end=" ")
            
            # 1. Build URL
            sppl = make_sppl(draw_no)
            url = f"{BASE_TOTO_URL}?sppl={sppl}"
            
            # 2. Scrape
            html = fetch_html(url)
            parsed = parse_toto_tables_wrap(html)
            
            # 3. Validate
            if not is_released_toto(parsed):
                print("❌ Not fully released yet (Skipping).")
                continue

            # 4. Save to DB
            is_new = upsert_draw_result(parsed)
            
            if is_new:
                print("✅ Saved.")
                success_count += 1
            else:
                print("⏭️  Already exists.")
            
            # 5. Rate Limit (Important!)
            time.sleep(1) 

        except Exception as e:
            print(f"⚠️ Error: {e}")

    print(f"\n[DONE] Backfill complete. Added {success_count} new draws.")

if __name__ == "__main__":
    run_backfill()
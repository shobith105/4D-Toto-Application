from fastapi import APIRouter, HTTPException
from datetime import date
from app.models import DrawResult

router = APIRouter(prefix="/results", tags=["results"])


@router.get("/latest/{game_type}", response_model=DrawResult)
async def get_latest_results(game_type: str):
    """Get latest draw results for 4D or TOTO"""
    # TODO: Fetch from scraper or Supabase cache
    if game_type not in ["4D", "TOTO"]:
        raise HTTPException(status_code=400, detail="Invalid game_type. Use '4D' or 'TOTO'")
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.get("/{game_type}/{draw_date}", response_model=DrawResult)
async def get_results_by_date(game_type: str, draw_date: date):
    """Get draw results for a specific date"""
    # TODO: Fetch from Supabase
    if game_type not in ["4D", "TOTO"]:
        raise HTTPException(status_code=400, detail="Invalid game_type. Use '4D' or 'TOTO'")
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/check-all")
async def check_all_pending_tickets():
    """Batch check all pending tickets against latest results"""
    # TODO: Fetch all pending tickets
    # TODO: Check each against corresponding draw results
    # TODO: Send notifications for wins
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/scrape/{game_type}")
async def trigger_scrape(game_type: str):
    """Manually trigger scraping of latest results"""
    # TODO: Run scraper for specified game type
    if game_type not in ["4D", "TOTO"]:
        raise HTTPException(status_code=400, detail="Invalid game_type. Use '4D' or 'TOTO'")
    raise HTTPException(status_code=501, detail="Not implemented yet")

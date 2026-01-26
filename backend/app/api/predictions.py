from uuid import UUID
from app.services.dbconfig import authorised_user
from fastapi import APIRouter, HTTPException,Depends
from datetime import date
from typing import List

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("/{game_type}")
async def get_predictions(game_type: str,user_id:UUID = Depends(authorised_user)):
    """
    Get predictions for next draw (Educational purposes only)
    Returns predictions from 3 different models with confidence scores
    """
    from app.services.dbconfig import supabase
    
    if game_type not in ["4D", "TOTO"]:
        raise HTTPException(status_code=400, detail="Invalid game_type. Use '4D' or 'TOTO'")
    
    try:
        # Fetch latest predictions for the game type, ordered by creation date
        response = (
            supabase
            .table("prediction_logs")
            .select("*")
            .eq("game_type", game_type.lower())
            .order("created_at", desc=True)
            .limit(10)
            .execute()
        )
        
        predictions = response.data or []
        
        # Transform to match frontend expectations
        formatted_predictions = [
            {
                "model_name": pred["model_name"],
                "predicted_numbers": pred["predicted_numbers"],
                "confidence_score": pred["confidence_score"],
                "rationale": f"AI model prediction based on historical draw patterns and statistical analysis."
            }
            for pred in predictions
        ]
        
        return {
            "disclaimer": "For educational purposes only. Not financial advice.",
            "game_type": game_type,
            "predictions": formatted_predictions
        }
        
    except Exception as e:
        print(f"Error fetching predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch predictions: {str(e)}")


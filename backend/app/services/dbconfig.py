import os
from dotenv import load_dotenv
from supabase import create_client, Client
from uuid import UUID
from fastapi import Header, HTTPException,Depends



load_dotenv()
url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY")

supabase: Client=create_client(url,key)


sb: Client = create_client(url,key)

def authorised_user(authorization: str = Header(...)) -> UUID:
    """
    Validates the JWT token from the Authorization header and returns the user ID.
    
    Args:
        authorization: The Authorization header (Bearer token)
        
    Returns:
        UUID: The authenticated user's ID
        
    Raises:
        HTTPException: If token is invalid or user is not authenticated
    """
    try:
        # Check if Authorization header has Bearer token
        if not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401, 
                detail="Invalid authorization header format. Expected 'Bearer <token>'"
            )
        
        # Extract token
        token = authorization.replace("Bearer ", "")
        
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)
        
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        # Return user ID as UUID
        return UUID(user_response.user.id)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

def save_ticket_details(ticket_data: dict):
    """
    Saves ONE ticket row to the tickets table and returns the inserted row.
    ticket_data must match your DB columns (and be JSON-serializable).
    """
    try:
        res = supabase.table("tickets").insert(ticket_data).execute()

        # supabase-py returns inserted rows in res.data on success
        if not getattr(res, "data", None):
            # Some versions also provide res.error
            err = getattr(res, "error", None)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save ticket data{': ' + str(err) if err else ''}."
            )
        return True

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
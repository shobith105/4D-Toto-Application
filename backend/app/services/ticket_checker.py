"""
Ticket checking service for TOTO draws.
Evaluates user tickets against official draw results and persists outcomes.
"""

from itertools import combinations
from typing import List, Dict, Any, Optional
from uuid import UUID
from app.services.dbconfig import supabase
from fastapi import HTTPException


def generate_combinations(numbers: List[int], system: int) -> List[List[int]]:
    """
    Generate all 6-number combinations from a system ticket.
    
    Args:
        numbers: List of numbers on the ticket (6-12 numbers)
        system: System type (6, 7, 8, 9, 10, 11, or 12)
    
    Returns:
        List of all possible 6-number combinations
    """
    if system == 6:
        return [sorted(numbers)]
    
    return [sorted(list(combo)) for combo in combinations(numbers, 6)]


def evaluate_toto_combination(
    combination: List[int],
    winning_numbers: List[int],
    additional_number: int
) -> Optional[Dict[str, Any]]:
    """
    Evaluate a single 6-number combination against draw results.
    
    Args:
        combination: 6 numbers from the ticket
        winning_numbers: 6 winning numbers from the draw
        additional_number: Additional number from the draw
    
    Returns:
        Dictionary with evaluation details if it wins, None if no prize
    """
    # Count main matches (intersection with winning numbers)
    main_matches = len(set(combination) & set(winning_numbers))
    
    # Check if additional number is in the combination (but not in winning numbers)
    has_additional = additional_number in combination and additional_number not in winning_numbers
    
    # Determine prize group
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
    
    # Return None if no prize (< 3 main matches)
    if prize_group is None:
        return None
    
    return {
        "combination": combination,
        "prize_group": prize_group,
        "main_matches": main_matches,
        "has_additional": has_additional
    }


def evaluate_toto_ticket(
    ticket_details: Dict[str, Any],
    draw_payload: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate a TOTO ticket against a draw result.
    
    Args:
        ticket_details: Ticket details JSON containing 'numbers' and 'system'
        draw_payload: Draw payload JSON containing 'winning_numbers' and 'additional_number'
    
    Returns:
        Dictionary with is_win, highest_prize_group, and details
    """
    ticket_numbers = ticket_details.get("numbers", [])
    system = ticket_details.get("system", 6)
    
    winning_numbers = draw_payload.get("winning_numbers", [])
    additional_number = draw_payload.get("additional_number")
    
    # Validate inputs
    if not ticket_numbers or len(ticket_numbers) < 6:
        raise ValueError("Invalid ticket: must have at least 6 numbers")
    
    if not winning_numbers or len(winning_numbers) != 6:
        raise ValueError("Invalid draw: must have exactly 6 winning numbers")
    
    if additional_number is None:
        raise ValueError("Invalid draw: missing additional number")
    
    # Generate all combinations
    all_combinations = generate_combinations(ticket_numbers, system)
    
    # Evaluate each combination
    winning_details = []
    for combo in all_combinations:
        result = evaluate_toto_combination(combo, winning_numbers, additional_number)
        if result:
            winning_details.append(result)
    
    # Determine overall result
    if not winning_details:
        return {
            "is_win": False,
            "highest_prize_group": None,
            "details": []
        }
    
    # Find highest prize group (lowest number = highest prize)
    highest_prize_group = min(detail["prize_group"] for detail in winning_details)
    
    return {
        "is_win": True,
        "highest_prize_group": highest_prize_group,
        "details": winning_details
    }


def check_tickets_for_draw(draw_id: str) -> Dict[str, Any]:
    """
    Check all tickets for a specific draw and persist results.
    This function is IDEMPOTENT - safe to run multiple times.
    
    Args:
        draw_id: UUID of the draw in draw_results table
    
    Returns:
        Summary of the checking operation
    """
    try:
        # Fetch the draw result
        draw_response = supabase.table('draw_results').select('*').eq('uid', draw_id).single().execute()
        
        if not draw_response.data:
            raise HTTPException(status_code=404, detail=f"Draw not found: {draw_id}")
        
        draw = draw_response.data
        game_type = draw.get('game')
        draw_date = draw.get('draw_date')
        draw_payload = draw.get('result', {})
        
        # Only handle TOTO for now
        if game_type != 'toto':
            raise HTTPException(status_code=400, detail=f"Unsupported game type: {game_type}")
        
        # Fetch all tickets for this draw
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
        
        # Process each ticket
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
                
                # Extract TOTO entry from ticket details
                toto_entry = ticket_details.get('toto_entry', {})
                
                # Build simplified structure for evaluation
                evaluation_details = {
                    "numbers": toto_entry.get("numbers", []),
                    "system": toto_entry.get("system_size", 6)
                }
                
                # Evaluate the ticket
                evaluation = evaluate_toto_ticket(evaluation_details, draw_payload)
                
                # Prepare ticket_check record
                ticket_check = {
                    "ticket_id": ticket_id,
                    "draw_id": draw_id,
                    "is_win": evaluation["is_win"],
                    "highest_prize_group": evaluation["highest_prize_group"],
                    "details": evaluation["details"]
                }
                
                # UPSERT to handle idempotency
                # Use upsert to avoid duplicates (unique constraint on ticket_id, draw_id)
                check_response = supabase.table('ticket_checks').upsert(
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
    This is the main entry point for the scheduled job.
    
    Returns:
        Summary of all draws processed
    """
    try:
        # Find all draws that need processing
        # Strategy: Find draws that have associated tickets but no ticket_checks
        
        # Get all draw IDs
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
            draw_date = draw.get('draw_date')
            
            # Check if this draw already has ticket_checks
            existing_checks = supabase.table('ticket_checks').select('id', count='exact').eq('draw_id', draw_id).execute()
            
            # Get count of tickets for this draw
            tickets_count = supabase.table('tickets').select('id', count='exact').eq('game_type', 'TOTO').eq('draw_date', draw.get('draw_date')).execute()
            
            tickets_total = tickets_count.count or 0
            checks_total = existing_checks.count or 0
            
            # Only process if there are tickets and not all have been checked
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

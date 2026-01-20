"""
Standalone script to check tickets and generate notifications.
Runs after draw results are scraped and stored in Supabase.
"""

import os
import sys
from datetime import datetime

# Add the backend app to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.services.ticket_checker import check_all_unprocessed_draws
from app.services.notification_generator import generate_notifications_for_all_checks


def main():
    """
    Main execution flow:
    1. Check all tickets against draw results
    2. Generate notifications for users
    """
    print("\n" + "=" * 60)
    print("TICKETSENSE - TICKET CHECKER & NOTIFIER")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Step 1: Check tickets against draw results
    print("\n[STEP 1] Checking tickets against draw results...")
    print("-" * 60)
    
    try:
        check_results = check_all_unprocessed_draws()
        
        draws_processed = check_results.get('draws_processed', 0)
        tickets_checked = check_results.get('total_tickets_checked', 0)
        total_wins = check_results.get('total_wins', 0)
        total_losses = check_results.get('total_losses', 0)
        
        print(f"\n✓ Draws processed: {draws_processed}")
        print(f"✓ Tickets checked: {tickets_checked}")
        print(f"✓ Winners: {total_wins}")
        print(f"✓ Non-winners: {total_losses}")
        
        if draws_processed == 0:
            print("\nℹ No new draws to process. Exiting.")
            sys.exit(0)
            
    except Exception as e:
        print(f"\n✗ Error checking tickets: {str(e)}")
        sys.exit(1)
    
    # Step 2: Generate notifications for users
    print("\n[STEP 2] Generating user notifications...")
    print("-" * 60)
    
    try:
        # Notify losers by default (set to False to only notify winners)
        notify_losses = os.getenv('NOTIFY_LOSSES', 'true').lower() == 'true'
        
        notify_results = generate_notifications_for_all_checks(notify_losses)
        
        checks_processed = notify_results.get('total_checks_processed', 0)
        win_notifications = notify_results.get('win_notifications', 0)
        loss_notifications = notify_results.get('loss_notifications', 0)
        skipped = notify_results.get('skipped', 0)
        errors = notify_results.get('errors', [])
        
        print(f"\n✓ Checks processed: {checks_processed}")
        print(f"✓ Win notifications created: {win_notifications}")
        print(f"✓ Loss notifications created: {loss_notifications}")
        print(f"✓ Already notified (skipped): {skipped}")
        
        if errors:
            print(f"\n⚠ Errors encountered: {len(errors)}")
            for error in errors[:5]:  # Show first 5 errors
                print(f"  - {error.get('error', 'Unknown error')}")
                
    except Exception as e:
        print(f"\n✗ Error generating notifications: {str(e)}")
        sys.exit(1)
    
    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"✓ {tickets_checked} tickets checked")
    print(f"✓ {win_notifications} users notified of wins")
    if notify_losses:
        print(f"✓ {loss_notifications} users notified of losses")
    print(f"\n✅ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60 + "\n")
    
    sys.exit(0)


if __name__ == "__main__":
    main()

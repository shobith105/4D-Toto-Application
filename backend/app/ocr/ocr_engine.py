# app/services/gemini_ocr.py
import os
import json
from typing import Dict, Any

from google import genai
from google.genai import types

from app.models import TicketCreateData


def process_image_with_gemini(image_bytes: bytes, mime_type: str) -> Dict[str, Any]:
    """
    OCR + structured extraction for BOTH 4D and TOTO.
    Returns a dict that should validate as TicketCreateData.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    print("Using Gemini API Key:", api_key[-5:])  # Print last 5 chars for verification

    client = genai.Client(api_key=api_key)

    # Generate JSON schema from your single Pydantic model
    schema = TicketCreateData.model_json_schema()

    prompt = (
        "You are an OCR extraction system for Singapore Pools lottery tickets.\n"
        "Return ONLY valid JSON matching the provided schema.\n\n"
        "Global rules:\n"
        "- draw_date MUST be ISO format YYYY-MM-DD.\n"
        "- ticket_price must be a number.\n"
        "- game_type must be exactly '4D' or 'TOTO'.\n\n"
        "If the ticket is 4D:\n"
        "- Set game_type='4D'\n"
        "- Set toto_entry=null\n"
        "- Extract fourd_bets as an array of bet lines.\n"
        "- For each bet line:\n"
        "  - entry_type is one of: Ordinary, Roll, System, iBet\n"
        "  - Ordinary/System/iBet: number is a 4-digit STRING (keep leading zeros), roll_pattern=null\n"
        "  - Roll: roll_pattern like '58X2' (exactly one X), number=null\n"
        "  - Extract BIG and SML stakes into big_amount and small_amount\n"
        "  - If 'PERMUTATIONS' is printed, set permutations; else null\n\n"
        "If the ticket is TOTO:\n"
        "- Set game_type='TOTO'\n"
        "- Set fourd_bets=null\n"
        "- toto_entry.bet_type is one of: Ordinary, System, SystemRoll\n"
        "- Ordinary: numbers is exactly 6 unique integers (1-49)\n"
        "- System: system_size is 7-12 and numbers length equals system_size\n"
        "- SystemRoll: set system_roll with fixed_numbers (5 ints) and roll_from/roll_to (inclusive). "
        "numbers=null and system_size=null\n\n"
        "No markdown. No extra text."
    )

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
        ),
    )

    return json.loads(resp.text)

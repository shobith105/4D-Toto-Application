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
    
    client = genai.Client(api_key=api_key)

    # Generate JSON schema from single Pydantic model
    schema = TicketCreateData.model_json_schema()

    prompt = (
    "You are an OCR extraction system for Singapore Pools lottery tickets.\n"
    "Return ONLY valid JSON matching the provided schema.\n\n"
    "Global rules:\n"
    "- draw_date MUST be ISO format YYYY-MM-DD.\n"
    "- ticket_price must be a number (e.g. 14 or 14.0). Ignore '$'.\n"
    "- game_type must be exactly '4D' or 'TOTO'.\n"
    "- No markdown. No extra text.\n\n"

    "IMPORTANT TOTO LAYOUT RULES:\n"
    "- A single TOTO ticket can contain MULTIPLE selections labeled A, B, C, etc.\n"
    "- You MUST extract ALL selections and output them in `toto_entries` as an array.\n"
    "- Each selection has its own set of numbers.\n"
    "- Numbers may WRAP onto the next line (e.g. last number printed below). "
    "Treat wrapped numbers as part of the SAME selection.\n"
    "- Convert leading-zero numbers like '05' to integer 5.\n"
    "- Ignore the labels 'A-', 'B-' and any non-number text.\n\n"

    "If the ticket is 4D:\n"
    "- Set game_type='4D'\n"
    "- Set toto_entries=null and toto_entry=null\n"
    "- Extract fourd_bets as an array of bet lines.\n"
    "- You MUST look out for Big and Small bets for each line.\n"
    '''CRITICAL 4D STAKES RULE:
- For EACH 4D bet line (A., B., C., etc.), extract the stake amounts shown beside BIG and SML.
- They appear like: "BIG $10" and "SML $10" on the SAME line as the 4-digit number.
- Set big_amount and small_amount as numbers (e.g., 10 or 10.0). Do NOT leave them as 0 unless the ticket explicitly shows 0 or the stake is absent.
- If the ticket shows only BIG (no SML), set small_amount=0. If only SML, set big_amount=0.
- Use the printed PRICE as a consistency check: sum of all (big_amount + small_amount) across all bet lines should equal ticket_price.
'''
    "  (keep your existing 4D rules...)\n\n"

    "If the ticket is TOTO:\n"
    "- Set game_type='TOTO'\n"
    "- Set fourd_bets=null\n"
    "- Output `toto_entries` as an array of TotoEntry objects.\n"
    "- For each TotoEntry:\n"
    "  - label: 'A'/'B'/... if printed; else null\n"
    "  - bet_type is one of: Ordinary, System, SystemRoll\n"
    "  - Ordinary: numbers is exactly 6 unique integers (1-49)\n"
    "  - System: numbers has 7-12 unique integers; set system_size accordingly\n"
    "  - SystemRoll: set system_roll; numbers=null and system_size=null\n\n"

    "Example for a TOTO ticket with two System 7 selections:\n"
    "{\n"
    "  \"game_type\": \"TOTO\",\n"
    "  \"draw_date\": \"2025-04-21\",\n"
    "  \"ticket_price\": 14,\n"
    "  \"fourd_bets\": null,\n"
    "  \"toto_entries\": [\n"
    "    {\"label\":\"A\",\"bet_type\":\"System\",\"numbers\":[5,10,13,18,21,27,37],\"system_size\":7,\"system_roll\":null},\n"
    "    {\"label\":\"B\",\"bet_type\":\"System\",\"numbers\":[2,17,30,37,38,41,43],\"system_size\":7,\"system_roll\":null}\n"
    "  ]\n"
    "}\n"
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

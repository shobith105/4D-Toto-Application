# Pydantic models for FastAPI request/response validation

from .ticket import TicketCreateData
from .draw import DrawResult, DrawCheckRequest
from .ocr import OCRResult, OCRLineResult, OCRTestResponse

__all__ = [
    "TicketCreateData", 
    "TicketResponse",
    "TicketListResponse",
    "DrawResult",
    "DrawCheckRequest",
    "OCRResult",
    "OCRLineResult",
    "OCRTestResponse",
]

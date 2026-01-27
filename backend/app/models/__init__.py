# Pydantic models for FastAPI request/response validation

from .ticket import TicketCreateData


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

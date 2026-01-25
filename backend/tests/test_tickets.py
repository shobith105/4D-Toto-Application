import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest.mock import Mock, patch, MagicMock,AsyncMock
from uuid import uuid4, UUID
import io
from app.api.tickets import router
from app.services.dbconfig import authorised_user

# Create test app
app = FastAPI()
app.include_router(router)
client = TestClient(app)


# ==================== Fixtures ====================

@pytest.fixture
def mock_user_id():
    return uuid4()


@pytest.fixture
def mock_auth_header():
    return {"Authorization": "Bearer mock_token_12345"}


@pytest.fixture
def override_auth_dependency(mock_user_id):
    """Override the authorised_user dependency to return a mock user ID"""
    async def mock_authorised_user():
        return mock_user_id
    
    app.dependency_overrides[authorised_user] = mock_authorised_user
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def sample_4d_ticket():
    # Matches TicketCreateData exactly
    return {
        "game_type": "4D",
        "draw_date": "2026-01-30",
        "ticket_price": 2.00,
        # Note: Model expects 'fourd_bets', NOT 'details' dict
        "fourd_bets": [
            {
                "entry_type": "Ordinary",
                "number": "1234",
                "big_amount": 1.00,
                "small_amount": 1.00
            }
        ],
        "toto_entries": None,
        "toto_entry": None
    }

@pytest.fixture
def sample_toto_ticket():
    # Matches TicketCreateData exactly
    return {
        "game_type": "TOTO",
        "draw_date": "2026-01-27",
        "ticket_price": 1.00,
        # Note: Model expects 'toto_entries', NOT 'details' dict
        "toto_entries": [
            {
                "bet_type": "Ordinary",
                "numbers": [1, 12, 23, 34, 40, 45],
                "system_size": None,
                "system_roll": None
            }
        ],
        "fourd_bets": None
    }


# ==================== POST /tickets/upload Tests ====================

@patch('app.api.tickets.run_blocking_with_timeout')
def test_upload_4d_ticket_success(mock_timeout, override_auth_dependency, mock_auth_header, sample_4d_ticket):
    """Test successful 4D ticket upload"""
    mock_timeout.return_value = sample_4d_ticket
    
    test_image = io.BytesIO(b"fake image data")
    files = {"file": ("ticket.jpg", test_image, "image/jpeg")}
    
    response = client.post("/tickets/upload", files=files, headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["game_type"] == "4D"
    assert data["data"]["ticket_price"] == 2.0


@patch('app.api.tickets.run_blocking_with_timeout')
def test_upload_toto_ticket_success(mock_timeout, override_auth_dependency, mock_auth_header, sample_toto_ticket):
    """Test successful TOTO ticket upload"""
    mock_timeout.return_value = sample_toto_ticket
    
    test_image = io.BytesIO(b"fake image data")
    files = {"file": ("ticket.png", test_image, "image/png")}
    
    response = client.post("/tickets/upload", files=files, headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["data"]["game_type"] == "TOTO"


def test_upload_invalid_file_type(override_auth_dependency, mock_auth_header):
    """Test upload with invalid file type"""
    test_file = io.BytesIO(b"fake pdf data")
    files = {"file": ("ticket.pdf", test_file, "application/pdf")}
    
    response = client.post("/tickets/upload", files=files, headers=mock_auth_header)
    
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_upload_file_too_large(override_auth_dependency, mock_auth_header):
    """Test upload with file exceeding size limit"""
    large_data = b"x" * (6 * 1024 * 1024)  # 6MB
    test_file = io.BytesIO(large_data)
    files = {"file": ("large.jpg", test_file, "image/jpeg")}
    
    response = client.post("/tickets/upload", files=files, headers=mock_auth_header)
    
    assert response.status_code == 413
    assert "File too large" in response.json()["detail"]


@patch('app.api.tickets.run_blocking_with_timeout')
def test_upload_invalid_ocr_data(mock_timeout, override_auth_dependency, mock_auth_header):
    """Test upload when OCR returns invalid data"""
    mock_timeout.return_value = {"game_type": "4D"}  # Missing required fields
    
    test_image = io.BytesIO(b"fake image data")
    files = {"file": ("ticket.jpg", test_image, "image/jpeg")}
    
    response = client.post("/tickets/upload", files=files, headers=mock_auth_header)
    
    assert response.status_code == 422


# ==================== GET /tickets/ Tests ====================

@patch('app.services.dbconfig.supabase')
def test_get_tickets_success(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header):
    """Test successful retrieval of tickets"""
    mock_tickets = [
        {
            "id": str(uuid4()),
            "user_id": str(mock_user_id),
            "game_type": "4D",
            "status": "pending",
            "ticket_price": 2.00
        }
    ]
    
    mock_response = MagicMock()
    mock_response.data = mock_tickets
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    
    response = client.get("/tickets/", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["tickets"]) == 1
    assert data["tickets"][0]["game_type"] == "4D"


@patch('app.services.dbconfig.supabase')
def test_get_tickets_empty(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test retrieval when user has no tickets"""
    mock_response = MagicMock()
    mock_response.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    
    response = client.get("/tickets/", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["tickets"] == []


@patch('app.services.dbconfig.supabase')
def test_get_tickets_multiple(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test retrieval of multiple tickets"""
    mock_tickets = [
        {"id": str(uuid4()), "game_type": "4D", "status": "pending"},
        {"id": str(uuid4()), "game_type": "TOTO", "status": "win"}
    ]
    
    mock_response = MagicMock()
    mock_response.data = mock_tickets
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    
    response = client.get("/tickets/", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["tickets"]) == 2


@patch('app.services.dbconfig.supabase')
def test_get_tickets_database_error(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test handling of database errors"""
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.side_effect = Exception("Database error")
    
    response = client.get("/tickets/", headers=mock_auth_header)
    
    assert response.status_code == 500
    assert "Failed to fetch tickets" in response.json()["detail"]
    
# ==================== DELETE /tickets/{ticket_id} Tests ====================

@patch('app.services.dbconfig.supabase')
def test_delete_ticket_success(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test successful deletion of a ticket"""
    ticket_id = str(uuid4())
    
    # Mock the execute() response to look like a successful delete (returns data)
    mock_response = MagicMock()
    mock_response.data = [{"id": ticket_id}] 
    
    # Chain the mock calls: table().delete().eq().eq().execute()
    mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.delete(f"/tickets/{ticket_id}", headers=mock_auth_header)
    
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["ticket_id"] == ticket_id

@patch('app.services.dbconfig.supabase')
def test_delete_ticket_not_found(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test deletion when ticket doesn't exist or belongs to another user"""
    ticket_id = str(uuid4())
    
    # Mock response data as None (simulating no rows deleted)
    mock_response = MagicMock()
    mock_response.data = None
    
    mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.delete(f"/tickets/{ticket_id}", headers=mock_auth_header)
    
    assert response.status_code == 404
    assert response.json()["detail"] == "Ticket not found"

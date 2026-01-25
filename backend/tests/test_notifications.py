import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest.mock import patch, MagicMock
from uuid import uuid4
from datetime import datetime

from app.api.notifications import router
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
def sample_notification():
    return {
        "id": str(uuid4()),
        "user_id": str(uuid4()),
        "type": "win",
        "title": "🎉 Congratulations! You Won!",
        "message": "Your ticket has won a prize in the latest 4D draw!",
        "data": {
            "game_type": "4D",
            "draw_date": "2026-01-19",
            "prize_amount": "2500.00",
            "ticket_numbers": "1234"
        },
        "is_read": False,
        "created_at": datetime.now().isoformat()
    }


# ==================== POST /notifications/mock Tests ====================

@patch('app.api.notifications.supabase')
def test_create_mock_notification_success(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header):
    """Test successful creation of a mock notification"""
    mock_notification = {
        "id": str(uuid4()),
        "user_id": str(mock_user_id),
        "type": "win",
        "title": "🎉 Congratulations! You Won!",
        "is_read": False
    }
    
    mock_response = MagicMock()
    mock_response.data = [mock_notification]
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_response
    
    response = client.post("/notifications/mock", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Mock notification created successfully"
    assert data["notification"]["user_id"] == str(mock_user_id)
    assert data["notification"]["type"] == "win"


@patch('app.api.notifications.supabase')
def test_create_mock_notification_database_error(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test handling of database errors when creating notification"""
    mock_response = MagicMock()
    mock_response.data = None
    mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_response
    
    response = client.post("/notifications/mock", headers=mock_auth_header)
    
    assert response.status_code == 500
    assert "Failed to create notification" in response.json()["detail"]


# ==================== GET /notifications Tests ====================

@patch('app.api.notifications.supabase')
def test_get_notifications_success(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header, sample_notification):
    """Test successful retrieval of notifications"""
    sample_notification["user_id"] = str(mock_user_id)
    mock_notifications = [sample_notification]
    
    mock_response = MagicMock()
    mock_response.data = mock_notifications
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    
    response = client.get("/notifications", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert "notifications" in data
    assert len(data["notifications"]) == 1
    assert data["notifications"][0]["user_id"] == str(mock_user_id)


@patch('app.api.notifications.supabase')
def test_get_notifications_empty(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test retrieval when user has no notifications"""
    mock_response = MagicMock()
    mock_response.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    
    response = client.get("/notifications", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["notifications"] == []


@patch('app.api.notifications.supabase')
def test_get_notifications_multiple(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header):
    """Test retrieval of multiple notifications"""
    mock_notifications = [
        {"id": str(uuid4()), "user_id": str(mock_user_id), "type": "win", "is_read": False},
        {"id": str(uuid4()), "user_id": str(mock_user_id), "type": "info", "is_read": True}
    ]
    
    mock_response = MagicMock()
    mock_response.data = mock_notifications
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = mock_response
    
    response = client.get("/notifications", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["notifications"]) == 2


@patch('app.api.notifications.supabase')
def test_get_notifications_database_error(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test handling of database errors when fetching notifications"""
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.side_effect = Exception("Database error")
    
    response = client.get("/notifications", headers=mock_auth_header)
    
    assert response.status_code == 500


# ==================== PATCH /notifications/{notification_id}/read Tests ====================

@patch('app.api.notifications.supabase')
def test_mark_notification_as_read_success(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header, sample_notification):
    """Test successfully marking a notification as read"""
    notification_id = str(uuid4())
    sample_notification["id"] = notification_id
    sample_notification["user_id"] = str(mock_user_id)
    sample_notification["is_read"] = True
    
    mock_response = MagicMock()
    mock_response.data = [sample_notification]
    mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.patch(f"/notifications/{notification_id}/read", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Notification marked as read"
    assert data["notification"]["is_read"] == True


@patch('app.api.notifications.supabase')
def test_mark_notification_as_read_not_found(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test marking notification as read when it doesn't exist"""
    notification_id = str(uuid4())
    
    mock_response = MagicMock()
    mock_response.data = None
    mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.patch(f"/notifications/{notification_id}/read", headers=mock_auth_header)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


# ==================== PATCH /notifications/mark-all-read Tests ====================

@patch('app.api.notifications.supabase')
def test_mark_all_notifications_as_read_success(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header):
    """Test successfully marking all notifications as read"""
    mock_notifications = [
        {"id": str(uuid4()), "is_read": True},
        {"id": str(uuid4()), "is_read": True}
    ]
    
    mock_response = MagicMock()
    mock_response.data = mock_notifications
    mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.patch("/notifications/mark-all-read", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "All notifications marked as read"
    assert data["count"] == 2


@patch('app.api.notifications.supabase')
def test_mark_all_notifications_as_read_none_unread(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test marking all as read when there are no unread notifications"""
    mock_response = MagicMock()
    mock_response.data = []
    mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.patch("/notifications/mark-all-read", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 0


@patch('app.api.notifications.supabase')
def test_mark_all_notifications_as_read_database_error(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test handling of database errors when marking all as read"""
    mock_supabase.table.return_value.update.return_value.eq.return_value.eq.return_value.execute.side_effect = Exception("Database error")
    
    response = client.patch("/notifications/mark-all-read", headers=mock_auth_header)
    
    assert response.status_code == 500


# ==================== DELETE /notifications/{notification_id} Tests ====================

@patch('app.api.notifications.supabase')
def test_delete_notification_success(mock_supabase, override_auth_dependency, mock_user_id, mock_auth_header):
    """Test successful deletion of a notification"""
    notification_id = str(uuid4())
    
    mock_response = MagicMock()
    mock_response.data = [{"id": notification_id}]
    mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.delete(f"/notifications/{notification_id}", headers=mock_auth_header)
    
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Notification deleted successfully"


@patch('app.api.notifications.supabase')
def test_delete_notification_not_found(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test deletion when notification doesn't exist or belongs to another user"""
    notification_id = str(uuid4())
    
    mock_response = MagicMock()
    mock_response.data = None
    mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.return_value = mock_response
    
    response = client.delete(f"/notifications/{notification_id}", headers=mock_auth_header)
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


@patch('app.api.notifications.supabase')
def test_delete_notification_database_error(mock_supabase, override_auth_dependency, mock_auth_header):
    """Test handling of database errors when deleting notification"""
    notification_id = str(uuid4())
    mock_supabase.table.return_value.delete.return_value.eq.return_value.eq.return_value.execute.side_effect = Exception("Database error")
    
    response = client.delete(f"/notifications/{notification_id}", headers=mock_auth_header)
    
    assert response.status_code == 500

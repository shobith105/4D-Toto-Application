import axios from 'axios';
import supabase from './supabaseClient';


const API_URL = 'http://localhost:8000/api';

/**
 * Get authorization headers with Supabase JWT token
 */
async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
        throw new Error('No active session. Please login again.');
    }
    
    return {
        'Authorization': `Bearer ${session.access_token}`
    };
}

export async function uploadTicket(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.post(`${API_URL}/tickets/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...authHeaders
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading ticket:", error);
        throw error;
    }
}

/**
 * Get all notifications for the authenticated user
 */
export async function getNotifications() {
    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.get(`${API_URL}/notifications`, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

/**
 * Create a mock notification for testing
 */
export async function createMockNotification() {
    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.post(`${API_URL}/notifications/mock`, {}, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error creating mock notification:", error);
        throw error;
    }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId) {
    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.patch(`${API_URL}/notifications/${notificationId}/read`, {}, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.patch(`${API_URL}/notifications/mark-all-read`, {}, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw error;
    }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId) {
    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.delete(`${API_URL}/notifications/${notificationId}`, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
}

/**
 * Get all tickets for the authenticated user
 */
export async function getTickets() {
    try {
        const authHeaders = await getAuthHeaders();
        
        const response = await axios.get(`${API_URL}/tickets/`, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        throw error;
    }
}

/**
 * Delete a ticket by ID for the authenticated user
 */
export async function deleteTicket(ticketId) {
    try {
        const authHeaders = await getAuthHeaders();

        const response = await axios.delete(`${API_URL}/tickets/${ticketId}`, {
            headers: authHeaders
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting ticket:", error);
        throw error;
    }
}

/**
 * Get AI predictions for a specific game type
 */
export async function getPredictions(gameType) {
    try {
        const authHeaders = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/predictions/${gameType}`,
            { headers: authHeaders }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching predictions:", error);
        throw error;
    }
}
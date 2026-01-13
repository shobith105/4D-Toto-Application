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
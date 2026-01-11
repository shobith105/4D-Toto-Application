import axios from 'axios';


const API_URL = 'http://localhost:8000/api';

export async function uploadTicket(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_URL}/tickets/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading ticket:", error);
        throw error;
    }
}
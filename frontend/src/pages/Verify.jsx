import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TicketDetails from '../components/TicketDetails';
import supabase from '../services/supabaseClient';

export default function Verify() {
  const location = useLocation();
  const navigate = useNavigate();
  const ticketData = location.state?.ticketData;

  // Debug logging
  console.log('Verify page - location.state:', location.state);
  console.log('Verify page - ticketData:', ticketData);

  // Redirect if no ticket data
  React.useEffect(() => {
    if (!ticketData) {
      console.log('No ticket data, redirecting to /home');
      navigate('/home');
    }
  }, [ticketData, navigate]);

  const handleConfirm = async (data) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please log in to save tickets');
        navigate('/login');
        return;
      }

      // Prepare payload for Supabase
      const payload = {
        user_id: user.id,
        game_type: data.game_type,
        draw_date: data.draw_date,
        ticket_price: data.ticket_price,
        details: data
      };

      console.log('Saving ticket to Supabase:', payload);
      
      // Save to Supabase tickets table
      const { data: savedTicket, error } = await supabase
        .from('tickets')
        .insert([payload])
        .select();
      
      if (error) {
        throw error;
      }
      
      console.log('Ticket saved successfully:', savedTicket);
      alert('Ticket saved successfully!');
      navigate('/tickets');
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to save ticket: ${error.message}`);
    }
  };

  const handleEdit = (data) => {
    // TODO: Navigate to edit page or show edit modal
    console.log('Edit ticket:', data);
    alert('Edit functionality coming soon!');
  };

  if (!ticketData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Ticket</h1>
          <p className="text-white/90">Confirm the extracted details before saving</p>
        </div>

        {/* Ticket Details Component */}
        <TicketDetails 
          ticketData={ticketData}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
        />

        {/* Back Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/home')}
            className="text-white/70 hover:text-white font-medium transition-colors"
          >
            ← Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
}

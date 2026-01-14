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

      // TODO: Save ticket to database via backend API
      console.log('Saving ticket:', data);
      
      alert('Ticket saved successfully!');
      navigate('/tickets'); // Navigate to ticket list page
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save ticket. Please try again.');
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
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/20 backdrop-blur mb-4">
            <span className="text-2xl font-bold text-fuchsia-500">M</span>
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
            className="text-slate-400 hover:text-fuchsia-500 font-medium transition-colors"
          >
            ← Back to Upload
          </button>
        </div>
      </div>
    </div>
  );
}

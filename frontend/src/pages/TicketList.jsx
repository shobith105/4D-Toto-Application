import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketDetails from '../components/TicketDetails';
import { getTickets, deleteTicket } from '../services/api';

export default function TicketList() {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) {
      return;
    }

    try {
      setActionError(null);
      setDeletingId(ticketId);

      await deleteTicket(ticketId);

      setTickets((prev) => prev.filter((ticket) => ticket.uuid !== ticketId));

      if (selectedTicket?.uuid === ticketId) {
        setSelectedTicket(null);
      }
    } catch (deleteError) {
      console.error('Error deleting ticket:', deleteError);

      if (deleteError.response?.status === 401) {
        navigate('/login');
        return;
      }

      const message = deleteError.response?.data?.detail || deleteError.message || 'Failed to delete ticket';
      setActionError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // Fetch tickets from backend API
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        // Fetch tickets using API
        const response = await getTickets();
        const data = response.tickets || [];

        // Map database format to component format
        const mappedTickets = data.map(ticket => {
          const details = ticket.details;
          
          // Extract numbers based on game type
          let raw_numbers = [];
          let bet_type = 'standard';
          let system_size = null;
          let expanded_combos = null;

          if (ticket.game_type === '4D') {
            // Extract 4D numbers from bets array
            if (details.bets && Array.isArray(details.bets)) {
              raw_numbers = details.bets.map(bet => bet.number || bet.roll_pattern);
              bet_type = details.bets[0]?.entry_type?.toLowerCase() || 'ordinary';
            }
          } else if (ticket.game_type === 'TOTO') {
            // Extract TOTO numbers from entries array
            if (details.entries && Array.isArray(details.entries)) {
              const entry = details.entries[0];
              raw_numbers = entry.numbers || [];
              bet_type = entry.bet_type?.toLowerCase() || 'ordinary';
              system_size = entry.system_size;
              
              // If it's a system bet, we might need to calculate combinations
              // For now, we'll just show the numbers
            }
          }

          return {
            uuid: ticket.id,
            game_type: ticket.game_type,
            bet_type: bet_type,
            system_size: system_size,
            raw_numbers: raw_numbers,
            draw_date: ticket.draw_date,
            purchase_date: details.purchase_date || ticket.created_at,
            ticket_price: ticket.ticket_price,
            win_status: ticket.status || 'pending',
            prize_amount: null, // TODO: Add when checking results
            confidence_score: details.confidence_score || 1.0,
            details: details // Keep full details for TicketDetails component
          };
        });

        setTickets(mappedTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        
        // Handle authentication errors
        if (error.response?.status === 401) {
          navigate('/login');
          return;
        }
        
        setError(error.message || 'Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{backgroundColor: '#020617'}}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent mb-4" style={{borderColor: '#7c3aed', borderRightColor: 'transparent'}}></div>
          <p style={{color: '#94a3b8'}}>Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center" style={{backgroundColor: '#020617'}}>
        <div className="text-center">
          <p className="font-bold mb-4" style={{color: '#f87171'}}>Error loading tickets: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-medium transition-all"
            style={{background: '#7c3aed', color: 'white'}}
            onMouseEnter={(e) => e.target.style.background = '#6d28d9'}
            onMouseLeave={(e) => e.target.style.background = '#7c3aed'}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24'}}>Pending</span>;
      case 'win':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{background: 'rgba(16, 185, 129, 0.2)', color: '#34d399'}}>Won!</span>;
      case 'loss':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{background: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8'}}>No Win</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-white p-4 md:p-6" style={{backgroundColor: '#020617'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-2xl backdrop-blur mb-3 md:mb-4" style={{background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)'}}>
            <svg className="w-6 h-6 md:w-7 md:h-7" style={{color: '#7c3aed'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p style={{color: '#cbd5e1'}}>View all your submitted tickets</p>
        </div>

        {actionError && (
          <div className="mb-4 rounded-lg border px-4 py-3" style={{background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fecdd3'}}>
            {actionError}
          </div>
        )}

        {/* Tickets List */}
        {selectedTicket ? (
          <TicketDetails 
            ticketData={selectedTicket.details || selectedTicket}
            allowEdit={false}
            onConfirm={(data) => {
              console.log('Confirmed ticket:', data);
              setSelectedTicket(null);
            }}
            onEdit={(data) => {
              console.log('Edit ticket:', data);
              // TODO: Show edit form
            }}
            onDelete={() => handleDeleteTicket(selectedTicket.uuid)}
          />
        ) : (
          <div className="space-y-3 md:space-y-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.uuid} 
                className="rounded-xl shadow-lg p-4 md:p-6 cursor-pointer transition-all duration-300"
                style={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                }}
                onClick={() => setSelectedTicket(ticket)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ticket.game_type === '4D' ? '#3b82f6' : '#7c3aed';
                  e.currentTarget.style.boxShadow = `0 0 30px ${ticket.game_type === '4D' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#1e293b';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
                }}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between mb-3 md:mb-4 gap-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    {/* Color-coded game type badge */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center font-bold text-white text-xs md:text-sm" style={{
                      background: ticket.game_type === '4D' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                      border: `1px solid ${ticket.game_type === '4D' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`
                    }}>
                      {ticket.game_type}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1 text-sm md:text-base">
                        {ticket.game_type} {ticket.bet_type === 'system' ? `System ${ticket.system_size}` : 'Entry'}
                      </h3>
                      <p className="text-xs md:text-sm font-semibold" style={{color: '#cbd5e1'}}>
                        {new Date(ticket.draw_date).toLocaleDateString('en-SG', { 
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs" style={{color: '#64748b'}}>Draw Date</p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                    {getStatusBadge(ticket.win_status)}
                    {ticket.win_status === 'win' && ticket.prize_amount > 0 && (
                      <span className="text-xs md:text-sm font-bold" style={{color: '#10b981'}}>
                        +${ticket.prize_amount.toLocaleString()}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTicket(ticket.uuid);
                      }}
                      disabled={deletingId === ticket.uuid}
                      className="px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-colors"
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: '#fca5a5',
                        opacity: deletingId === ticket.uuid ? 0.6 : 1
                      }}
                    >
                      {deletingId === ticket.uuid ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>

                {/* Numbers Display */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {ticket.raw_numbers.map((num, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center justify-center min-w-[2.5rem] md:min-w-[3rem] px-2 md:px-3 py-1.5 md:py-2 text-white font-bold rounded-lg text-sm md:text-base"
                      style={{background: '#1e293b', border: '1px solid #334155'}}
                    >
                      {num}
                    </span>
                  ))}
                </div>

                {/* System Bet Info */}
                {ticket.bet_type === 'system' && ticket.expanded_combos && (
                  <div className="mt-3 pt-3" style={{borderTop: '1px solid #334155'}}>
                    <p className="text-xs" style={{color: '#94a3b8'}}>
                      {ticket.expanded_combos.length} combinations • ${ticket.ticket_price.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {tickets.length === 0 && (
          <div className="rounded-xl shadow-lg p-12 text-center" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
            <svg 
              className="w-16 h-16 mx-auto mb-4" 
              style={{color: '#334155'}}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" 
              />
            </svg>
            <h3 className="text-lg font-semibold text-white mb-2">No tickets yet</h3>
            <p className="mb-6" style={{color: '#94a3b8'}}>Upload your first ticket to get started</p>
            <button
              onClick={() => navigate('/upload')}
              className="px-6 py-3 rounded-lg font-semibold transition-all"
              style={{background: '#10b981', color: 'white'}}
              onMouseEnter={(e) => e.target.style.background = '#059669'}
              onMouseLeave={(e) => e.target.style.background = '#10b981'}
            >
              Upload Ticket
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-8">
          <button
            onClick={() => navigate('/upload')}
            className="flex-1 py-2.5 md:py-3 rounded-lg font-semibold transition-all text-sm md:text-base"
            style={{background: '#10b981', color: 'white'}}
            onMouseEnter={(e) => {
              e.target.style.background = '#059669';
              e.target.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#10b981';
              e.target.style.boxShadow = 'none';
            }}
          >
            + Upload New Ticket
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="font-medium transition-colors"
            style={{color: '#94a3b8'}}
            onMouseEnter={(e) => e.target.style.color = '#cbd5e1'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

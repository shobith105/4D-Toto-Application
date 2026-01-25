import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketDetails from '../components/TicketDetails';
import supabase from '../services/supabaseClient';

export default function TicketList() {
  const navigate = useNavigate();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Fetch tickets from Supabase
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        // Fetch tickets for current user
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

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
        setError(error.message);
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
    <div className="min-h-screen text-white p-6" style={{backgroundColor: '#020617'}}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur mb-4" style={{background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)'}}>
            <svg className="w-7 h-7" style={{color: '#7c3aed'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p style={{color: '#cbd5e1'}}>View all your submitted tickets</p>
        </div>

        {/* Stats Summary with new theme */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg p-4 text-center" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-sm" style={{color: '#94a3b8'}}>Total Tickets</div>
          </div>
          <div className="rounded-lg p-4 text-center" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
            <div className="text-2xl font-bold" style={{color: '#fbbf24'}}>
              {tickets.filter(t => t.win_status === 'pending').length}
            </div>
            <div className="text-sm" style={{color: '#94a3b8'}}>Pending</div>
          </div>
          <div className="rounded-lg p-4 text-center" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
            <div className="text-2xl font-bold" style={{color: '#10b981'}}>
              {tickets.filter(t => t.win_status === 'win').length}
            </div>
            <div className="text-sm" style={{color: '#94a3b8'}}>Wins</div>
          </div>
        </div>

        {/* Tickets List */}
        {selectedTicket ? (
          <TicketDetails 
            ticketData={selectedTicket.details || selectedTicket}
            onConfirm={(data) => {
              console.log('Confirmed ticket:', data);
              setSelectedTicket(null);
            }}
            onEdit={(data) => {
              console.log('Edit ticket:', data);
              // TODO: Show edit form
            }}
          />
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div 
                key={ticket.uuid} 
                className="rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300"
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Color-coded game type badge */}
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-sm" style={{
                      background: ticket.game_type === '4D' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(124, 58, 237, 0.15)',
                      border: `1px solid ${ticket.game_type === '4D' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(124, 58, 237, 0.3)'}`
                    }}>
                      {ticket.game_type}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">
                        {ticket.game_type} {ticket.bet_type === 'system' ? `System ${ticket.system_size}` : 'Entry'}
                      </h3>
                      <p className="text-sm font-semibold" style={{color: '#cbd5e1'}}>
                        {new Date(ticket.draw_date).toLocaleDateString('en-SG', { 
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-xs" style={{color: '#64748b'}}>Draw Date</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(ticket.win_status)}
                    {ticket.win_status === 'win' && ticket.prize_amount > 0 && (
                      <span className="text-sm font-bold" style={{color: '#10b981'}}>
                        +${ticket.prize_amount.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Numbers Display */}
                <div className="flex flex-wrap gap-2">
                  {ticket.raw_numbers.map((num, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center justify-center min-w-[3rem] px-3 py-2 text-white font-bold rounded-lg"
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
              onClick={() => navigate('/home')}
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
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/home')}
            className="flex-1 py-3 rounded-lg font-semibold transition-all"
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
          <button
            onClick={() => console.log('Check all tickets')}
            className="flex-1 py-3 rounded-lg font-semibold transition-all"
            style={{background: '#0f172a', border: '1px solid #1e293b', color: 'white'}}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#7c3aed'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e293b'}
          >
            Check All Results
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

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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
          <p className="text-white/70">Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-bold mb-4">Error loading tickets: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-white/90"
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
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full">Pending</span>;
      case 'win':
        return <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">Won!</span>;
      case 'loss':
        return <span className="px-3 py-1 bg-white/5 text-white/70 text-xs font-semibold rounded-full">No Win</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 backdrop-blur mb-4">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-white/90">View all your submitted tickets</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-sm text-white/70">Total Tickets</div>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {tickets.filter(t => t.win_status === 'pending').length}
            </div>
            <div className="text-sm text-white/70">Pending</div>
          </div>
          <div className="bg-white/5 border border-white/20 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {tickets.filter(t => t.win_status === 'win').length}
            </div>
            <div className="text-sm text-white/70">Wins</div>
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
                className="bg-white/5 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-white/20 hover:border-white"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white ${
                      ticket.game_type === '4D' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>
                      {ticket.game_type}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {ticket.game_type} - {ticket.bet_type === 'system' ? `System ${ticket.system_size}` : 'Standard'}
                      </h3>
                      <p className="text-sm text-white/70">
                        Draw: {new Date(ticket.draw_date).toLocaleDateString('en-SG', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(ticket.win_status)}
                    {ticket.win_status === 'win' && ticket.prize_amount > 0 && (
                      <span className="text-sm font-semibold text-green-400">
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
                      className="inline-flex items-center justify-center min-w-[3rem] px-3 py-2 bg-white/10 text-white font-bold rounded-lg"
                    >
                      {num}
                    </span>
                  ))}
                </div>

                {/* System Bet Info */}
                {ticket.bet_type === 'system' && ticket.expanded_combos && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <p className="text-xs text-white/70">
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
          <div className="bg-white/5 rounded-xl shadow-lg p-12 text-center border border-white/20">
            <svg 
              className="w-16 h-16 mx-auto mb-4 text-white/20" 
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
            <p className="text-white/70 mb-6">Upload your first ticket to get started</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Upload Ticket
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/home')}
            className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            + Upload New Ticket
          </button>
          <button
            onClick={() => console.log('Check all tickets')}
            className="flex-1 bg-white/5 text-white py-3 rounded-lg font-medium hover:bg-white/10 transition-colors"
          >
            Check All Results
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white/70 hover:text-white font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

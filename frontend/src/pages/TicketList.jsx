import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketDetails from '../components/TicketDetails';

export default function TicketList() {
  const navigate = useNavigate();
  
  // Mock ticket data
  const [tickets] = useState([
    {
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      game_type: '4D',
      bet_type: 'standard',
      raw_numbers: [1234, 5678, 9012],
      draw_date: '2026-01-15',
      purchase_date: '2026-01-10',
      ticket_price: 3.00,
      win_status: 'pending',
      prize_amount: null,
      confidence_score: 0.95
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440002',
      game_type: 'TOTO',
      bet_type: 'system',
      system_size: 7,
      raw_numbers: [5, 12, 18, 23, 31, 42, 45],
      expanded_combos: [
        [5, 12, 18, 23, 31, 42],
        [5, 12, 18, 23, 31, 45],
        [5, 12, 18, 23, 42, 45],
        [5, 12, 18, 31, 42, 45],
        [5, 12, 23, 31, 42, 45],
        [5, 18, 23, 31, 42, 45],
        [12, 18, 23, 31, 42, 45]
      ],
      draw_date: '2026-01-18',
      purchase_date: '2026-01-11',
      ticket_price: 7.00,
      win_status: 'pending',
      prize_amount: null,
      confidence_score: 0.85
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440003',
      game_type: 'TOTO',
      bet_type: 'standard',
      raw_numbers: [7, 14, 21, 28, 35, 42],
      draw_date: '2026-01-08',
      purchase_date: '2026-01-05',
      ticket_price: 1.00,
      win_status: 'loss',
      prize_amount: 0,
      confidence_score: 0.99
    },
    {
      uuid: '550e8400-e29b-41d4-a716-446655440004',
      game_type: '4D',
      bet_type: 'standard',
      raw_numbers: [8888],
      draw_date: '2026-01-05',
      purchase_date: '2026-01-03',
      ticket_price: 1.00,
      win_status: 'win',
      prize_amount: 2500,
      confidence_score: 0.65
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full">Pending</span>;
      case 'win':
        return <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">Won!</span>;
      case 'loss':
        return <span className="px-3 py-1 bg-slate-700 text-slate-400 text-xs font-semibold rounded-full">No Win</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-fuchsia-500/20 backdrop-blur mb-4">
            <span className="text-2xl font-bold text-fuchsia-500">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-white/90">View all your submitted tickets</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-sm text-slate-400">Total Tickets</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {tickets.filter(t => t.win_status === 'pending').length}
            </div>
            <div className="text-sm text-slate-400">Pending</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {tickets.filter(t => t.win_status === 'win').length}
            </div>
            <div className="text-sm text-slate-400">Wins</div>
          </div>
        </div>

        {/* Tickets List */}
        {selectedTicket ? (
          <TicketDetails 
            ticketData={selectedTicket}
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
                className="bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-slate-700 hover:border-fuchsia-500"
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
                      <h3 className="font-semibold text-slate-200">
                        {ticket.game_type} - {ticket.bet_type === 'system' ? `System ${ticket.system_size}` : 'Standard'}
                      </h3>
                      <p className="text-sm text-slate-400">
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
                      className="inline-flex items-center justify-center min-w-[3rem] px-3 py-2 bg-fuchsia-500/20 text-fuchsia-300 font-bold rounded-lg"
                    >
                      {num}
                    </span>
                  ))}
                </div>

                {/* System Bet Info */}
                {ticket.bet_type === 'system' && ticket.expanded_combos && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <p className="text-xs text-slate-500">
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
          <div className="bg-slate-800 rounded-xl shadow-lg p-12 text-center border border-slate-700">
            <svg 
              className="w-16 h-16 mx-auto mb-4 text-slate-600" 
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
            <h3 className="text-lg font-semibold text-slate-200 mb-2">No tickets yet</h3>
            <p className="text-slate-400 mb-6">Upload your first ticket to get started</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-fuchsia-600 text-white rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
            >
              Upload Ticket
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/home')}
            className="flex-1 bg-fuchsia-600 text-white py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
          >
            + Upload New Ticket
          </button>
          <button
            onClick={() => console.log('Check all tickets')}
            className="flex-1 bg-slate-700 text-slate-200 py-3 rounded-lg font-medium hover:bg-slate-600 transition-colors"
          >
            Check All Results
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-fuchsia-500 font-medium transition-colors"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

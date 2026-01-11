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
      prize_amount: null
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
      prize_amount: null
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
      prize_amount: 0
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
      prize_amount: 2500
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Pending</span>;
      case 'win':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Won!</span>;
      case 'loss':
        return <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">No Win</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-rose-500 to-orange-400 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur mb-4">
            <span className="text-2xl font-bold text-white">M</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-white/90">View all your submitted tickets</p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{tickets.length}</div>
            <div className="text-sm text-white/80">Total Tickets</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {tickets.filter(t => t.win_status === 'pending').length}
            </div>
            <div className="text-sm text-white/80">Pending</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {tickets.filter(t => t.win_status === 'win').length}
            </div>
            <div className="text-sm text-white/80">Wins</div>
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
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
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
                      <h3 className="font-semibold text-slate-900">
                        {ticket.game_type} - {ticket.bet_type === 'system' ? `System ${ticket.system_size}` : 'Standard'}
                      </h3>
                      <p className="text-sm text-slate-500">
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
                      <span className="text-sm font-semibold text-green-600">
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
                      className="inline-flex items-center justify-center min-w-[3rem] px-3 py-2 bg-red-600 text-white font-bold rounded-lg"
                    >
                      {num}
                    </span>
                  ))}
                </div>

                {/* System Bet Info */}
                {ticket.bet_type === 'system' && ticket.expanded_combos && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
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
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg 
              className="w-16 h-16 mx-auto mb-4 text-slate-300" 
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
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No tickets yet</h3>
            <p className="text-slate-600 mb-6">Upload your first ticket to get started</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Upload Ticket
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/home')}
            className="flex-1 bg-white text-red-600 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            + Upload New Ticket
          </button>
          <button
            onClick={() => console.log('Check all tickets')}
            className="flex-1 bg-white/20 backdrop-blur text-white py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
          >
            Check All Results
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-white/90 hover:text-white font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

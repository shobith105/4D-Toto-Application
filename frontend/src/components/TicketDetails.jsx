import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep this import as it might be used later or for consistency

export default function TicketDetails({ ticketData, onConfirm, onEdit }) {
  const navigate = useNavigate();
  
  const {
    game_type,
    draw_date,
    ticket_price,
    fourd_bets,  // For 4D tickets
    toto_entry   // For TOTO tickets
  } = ticketData || {};

  // Derive bet type and system size from the appropriate field
  const bet_type = game_type === '4D' 
    ? (fourd_bets?.[0]?.entry_type || 'Ordinary')
    : (toto_entry?.bet_type || 'Ordinary');
  
  const system_size = game_type === 'TOTO' && toto_entry?.bet_type === 'System' 
    ? toto_entry.system_size 
    : null;

  // Get numbers for TOTO
  const toto_numbers = game_type === 'TOTO' ? (toto_entry?.numbers || []) : [];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(ticketData);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(ticketData);
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6 border border-slate-700">
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Verify Ticket Details</h1>
      <p className="text-white/90 text-center">Please confirm the extracted information</p>
      
      {/* Game Type */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Game Type</label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          <span className="text-lg font-semibold text-slate-200">{game_type || 'Not detected'}</span>
        </div>
      </div>

      {/* Bet Type */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Bet Type</label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          <span className="text-lg font-semibold text-slate-200 capitalize">{bet_type}</span>
          {game_type === 'TOTO' && bet_type === 'System' && system_size && (
            <span className="ml-2 text-sm text-slate-400">(System {system_size})</span>
          )}
        </div>
      </div>

      {/* Numbers */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {game_type === '4D' ? '4D Entries' : 'TOTO Numbers'}
        </label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          {game_type === '4D' && fourd_bets && fourd_bets.length > 0 ? (
            <div className="space-y-4">
              {fourd_bets.map((bet, index) => (
                <div key={index} className="p-4 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-medium">{String.fromCharCode(65 + index)}.</span>
                      <span className="inline-flex items-center justify-center px-4 py-2 bg-fuchsia-500/20 text-fuchsia-300 font-bold text-2xl rounded-lg">
                        {bet.number || bet.roll_pattern || 'N/A'}
                      </span>
                    </div>
                    <div className="text-right">
                      {bet.entry_type && (
                        <div className="text-xs text-slate-500 mb-1 uppercase">{bet.entry_type}</div>
                      )}
                      {bet.permutations && (
                        <div className="text-sm text-slate-400">
                          {bet.permutations} {bet.permutations === 1 ? 'Permutation' : 'Permutations'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 ml-8">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-semibold">BIG</span>
                      <span className="text-slate-400">${bet.big_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-semibold">SML</span>
                      <span className="text-slate-400">${bet.small_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : game_type === 'TOTO' ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {toto_numbers.map((num, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center justify-center w-12 h-12 bg-fuchsia-500/20 text-fuchsia-300 font-bold text-lg rounded-lg"
                  >
                    {num}
                  </span>
                ))}
              </div>
              {toto_entry?.bet_type === 'SystemRoll' && toto_entry.system_roll && (
                <div className="mt-4 p-3 bg-slate-800 rounded-lg border border-slate-600">
                  <div className="text-sm text-slate-400 mb-2">System Roll</div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300">Fixed Numbers:</span>
                    <div className="flex gap-1">
                      {toto_entry.system_roll.fixed_numbers.map((num, i) => (
                        <span key={i} className="inline-flex items-center justify-center w-8 h-8 bg-slate-700 text-slate-300 font-semibold text-xs rounded">
                          {num}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Roll Range: {toto_entry.system_roll.roll_from} - {toto_entry.system_roll.roll_to}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-400 text-center py-4">No entries found</div>
          )}
        </div>
      </div>

      {/* Draw Date */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Draw Date</label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          <span className="text-lg font-semibold text-slate-200">
            {new Date(draw_date).toLocaleDateString('en-SG', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Ticket Price */}
      {ticket_price && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Ticket Price</label>
          <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
            <span className="text-lg font-semibold text-slate-200">
              ${ticket_price.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={handleEdit}
          className="flex-1 bg-slate-700 text-slate-200 py-3 rounded-lg font-medium hover:bg-slate-600 transition-colors"
        >
          Edit Details
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 bg-fuchsia-600 text-white py-3 rounded-lg font-medium hover:bg-fuchsia-700 transition-colors"
        >
          Confirm & Save
        </button>
      </div>
    </div>
  );
}
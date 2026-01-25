import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep this import as it might be used later or for consistency

export default function TicketDetails({ ticketData, onConfirm, onEdit }) {
  const navigate = useNavigate();
  
  const {
    game_type,
    draw_date,
    ticket_price,
    fourd_bets,     // For 4D tickets
    toto_entries    // For TOTO tickets (array)
  } = ticketData || {};

  // Derive bet type from the first entry for display purposes
  const bet_type = game_type === '4D' 
    ? (fourd_bets?.[0]?.entry_type || 'Ordinary')
    : (toto_entries?.[0]?.bet_type || 'Ordinary');

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
    <div className="rounded-2xl shadow-2xl p-8 space-y-6" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Verify Ticket Details</h1>
      <p className="text-center" style={{color: '#cbd5e1'}}>Please confirm the extracted information</p>
      
      {/* Game Type */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Game Type</label>
        <div className="px-4 py-3 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <span className="text-lg font-semibold text-white">{game_type || 'Not detected'}</span>
        </div>
      </div>

      {/* Bet Type - only show for 4D or if all TOTO entries have the same type */}
      {game_type === '4D' && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Bet Type</label>
          <div className="px-4 py-3 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <span className="text-lg font-semibold text-white capitalize">{bet_type}</span>
          </div>
        </div>
      )}

      {/* Numbers */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>
          {game_type === '4D' ? '4D Entries' : 'TOTO Entries'}
        </label>
        <div className="px-4 py-3 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
          {game_type === '4D' && fourd_bets && fourd_bets.length > 0 ? (
            <div className="space-y-3">
              {fourd_bets.map((bet, index) => (
                <div key={index} className="flex items-center rounded-lg p-3" style={{background: '#1e293b', border: '1px solid #334155', gap: '16px'}}>
                  {/* 1. Row Badge (A, B, C) */}
                  <div className="flex-shrink-0 flex items-center justify-center rounded-md font-bold text-xs" style={{
                    background: '#334155',
                    color: '#94a3b8',
                    width: '28px',
                    height: '28px',
                    textTransform: 'uppercase'
                  }}>
                    {String.fromCharCode(65 + index)}
                  </div>

                  {/* 2. Ticket Number (Hero) */}
                  <div className="flex-grow">
                    <span className="font-bold text-3xl text-white" style={{letterSpacing: '3px'}}>
                      {bet.number || bet.roll_pattern || 'N/A'}
                    </span>
                    {bet.entry_type && (
                      <div className="text-xs mt-1" style={{color: '#94a3b8'}}>{bet.entry_type.toUpperCase()}</div>
                    )}
                  </div>

                  {/* 3. Bet Details (BIG/SML with prices) */}
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{color: '#cbd5e1'}}>BIG</span>
                      <span className="text-base font-semibold" style={{color: '#34d399'}}>${bet.big_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{color: '#cbd5e1'}}>SML</span>
                      <span className="text-base font-semibold" style={{color: '#34d399'}}>${bet.small_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : game_type === 'TOTO' && toto_entries && toto_entries.length > 0 ? (
            <div className="space-y-3">
              {toto_entries.map((entry, index) => (
                <div key={index} className="p-4 rounded-lg" style={{background: '#0f172a', border: '1px solid #334155'}}>
                  <div className="flex items-center gap-3 mb-3">
                    {/* Row Badge */}
                    <div className="flex-shrink-0 flex items-center justify-center rounded-md font-bold text-xs" style={{
                      background: '#334155',
                      color: '#94a3b8',
                      width: '28px',
                      height: '28px',
                      textTransform: 'uppercase'
                    }}>
                      {entry.label || String.fromCharCode(65 + index)}
                    </div>
                    <div>
                      <span className="text-sm font-semibold" style={{color: '#cbd5e1'}}>{entry.bet_type.toUpperCase()}</span>
                      {entry.bet_type === 'System' && entry.system_size && (
                        <span className="ml-2 text-xs" style={{color: '#94a3b8'}}>(System {entry.system_size})</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-10">
                    {entry.numbers && entry.numbers.map((num, numIndex) => (
                      <span 
                        key={numIndex}
                        className="inline-flex items-center justify-center w-12 h-12 font-bold text-lg rounded-full"
                        style={{background: '#1e293b', color: '#f1f5f9', border: '1px solid #475569'}}
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                  {entry.bet_type === 'SystemRoll' && entry.system_roll && (
                    <div className="mt-4 ml-10 p-3 rounded-lg" style={{background: '#020617', border: '1px solid #334155'}}>
                      <div className="text-sm mb-2" style={{color: '#94a3b8'}}>System Roll</div>
                      <div className="flex items-center gap-2">
                        <span style={{color: '#cbd5e1'}}>Fixed Numbers:</span>
                        <div className="flex gap-1">
                          {entry.system_roll.fixed_numbers.map((num, i) => (
                            <span key={i} className="inline-flex items-center justify-center w-8 h-8 font-semibold text-xs rounded" style={{background: '#1e293b', color: '#cbd5e1'}}>
                              {num}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm" style={{color: '#94a3b8'}}>
                        Roll Range: {entry.system_roll.roll_from} - {entry.system_roll.roll_to}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4" style={{color: '#94a3b8'}}>No entries found</div>
          )}
        </div>
      </div>

      {/* Draw Date */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Draw Date</label>
        <div className="px-4 py-3 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
          <span className="text-lg font-semibold text-white">
            {new Date(draw_date).toLocaleDateString('en-SG', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {/* Ticket Price - Styled as Result/Sum */}
      {ticket_price && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Total Price</label>
          <div className="px-4 py-4 rounded-lg" style={{background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981'}}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold" style={{color: '#6ee7b7'}}>Final Sum</span>
              <span className="text-2xl font-bold" style={{color: '#10b981'}}>
                ${ticket_price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={handleEdit}
          className="flex-1 py-3 rounded-lg font-semibold transition-all"
          style={{background: 'transparent', border: '2px solid #334155', color: '#cbd5e1'}}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#7c3aed';
            e.target.style.color = '#a78bfa';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#334155';
            e.target.style.color = '#cbd5e1';
          }}
        >
          Edit Details
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="flex-1 py-3 rounded-lg font-semibold transition-all"
          style={{background: '#7c3aed', color: 'white', boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'}}
          onMouseEnter={(e) => {
            e.target.style.background = '#6d28d9';
            e.target.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#7c3aed';
            e.target.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.3)';
          }}
        >
          Confirm & Save
        </button>
      </div>
    </div>
  );
}
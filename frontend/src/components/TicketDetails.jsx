import React from 'react';
import { useNavigate } from 'react-router-dom'; // Keep this import as it might be used later or for consistency

export default function TicketDetails({ ticketData, onConfirm, onEdit }) {
  const navigate = useNavigate(); // Keep this declaration as it might be used later or for consistency
  
  const {
    game_type,
    bet_type,
    system_size,
    raw_numbers,
    expanded_combos,
    draw_date,
    purchase_date,
    ticket_price,
    confidence_score
  } = ticketData;

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
      
      {/* Confidence Score Banner */}
      {confidence_score && (
        <div className={`p-4 rounded-lg ${
          confidence_score >= 0.9 ? 'bg-green-500/10 border border-green-500/30' :
          confidence_score >= 0.7 ? 'bg-yellow-500/10 border border-yellow-500/30' :
          'bg-red-500/10 border border-red-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`font-medium ${
              confidence_score >= 0.9 ? 'text-green-400' :
              confidence_score >= 0.7 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              OCR Confidence: {(confidence_score * 100).toFixed(1)}%
            </span>
            {confidence_score < 0.9 && (
              <span className="text-sm text-slate-400">Please verify carefully</span>
            )}
          </div>
        </div>
      )}

      {/* Game Type */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Game Type</label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          <span className="text-lg font-semibold text-slate-200">{game_type}</span>
        </div>
      </div>

      {/* Bet Type */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Bet Type</label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          <span className="text-lg font-semibold text-slate-200 capitalize">{bet_type}</span>
          {bet_type === 'system' && system_size && (
            <span className="ml-2 text-sm text-slate-400">(System {system_size})</span>
          )}
        </div>
      </div>

      {/* Numbers */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">
          {game_type === '4D' ? '4D Numbers' : 'TOTO Numbers'}
        </label>
        <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
          <div className="flex flex-wrap gap-2">
            {raw_numbers.map((num, index) => (
              <span 
                key={index}
                className="inline-flex items-center justify-center w-12 h-12 bg-fuchsia-500/20 text-fuchsia-300 font-bold text-lg rounded-lg"
              >
                {num}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Combinations (for System Bets) */}
      {bet_type === 'system' && expanded_combos && expanded_combos.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Expanded Combinations ({expanded_combos.length} total)
          </label>
          <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {expanded_combos.map((combo, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 w-8">#{index + 1}</span>
                  <div className="flex gap-1">
                    {combo.map((num, i) => (
                      <span 
                        key={i}
                        className="inline-flex items-center justify-center w-8 h-8 bg-slate-600 border border-slate-500 text-slate-300 font-semibold text-xs rounded"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

      {/* Purchase Date */}
      {purchase_date && (
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Purchase Date</label>
          <div className="px-4 py-3 bg-slate-700 rounded-lg border border-slate-600">
            <span className="text-slate-300">
              {new Date(purchase_date).toLocaleDateString('en-SG', { 
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>
      )}

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

      {/* Warning for low confidence */}
      {confidence_score && confidence_score < 0.7 && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <p className="text-sm text-orange-400">
            <strong>⚠️ Low confidence detected.</strong> Please carefully verify all numbers and dates before confirming.
          </p>
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
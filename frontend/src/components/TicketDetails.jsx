import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TicketDetails({ ticketData, onConfirm, onEdit, onDelete, allowEdit = true }) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(ticketData || {});
  const [currentData, setCurrentData] = useState(ticketData || {});
  
  const {
    game_type,
    draw_date,
    ticket_price,
    fourd_bets,
    toto_entries
  } = isEditing ? editedData : currentData;

  const bet_type = game_type === '4D' 
    ? (fourd_bets?.[0]?.entry_type || 'Ordinary')
    : (toto_entries?.[0]?.bet_type || 'Ordinary');

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(currentData);
    }
  };

  const handleEdit = () => {
    if (!allowEdit) return;
    setIsEditing(true);
    setEditedData(JSON.parse(JSON.stringify(currentData))); // Deep clone
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedData(currentData);
  };

  const handleSaveEdit = () => {
    setCurrentData(editedData); // Update the display data
    setIsEditing(false);
    if (onEdit) {
      onEdit(editedData);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(ticketData);
    }
  };

  const updateGameType = (newType) => {
    setEditedData({
      ...editedData,
      game_type: newType,
      fourd_bets: newType === '4D' ? (editedData.fourd_bets || []) : null,
      toto_entries: newType === 'TOTO' ? (editedData.toto_entries || []) : null
    });
  };

  const update4DBet = (index, field, value) => {
    const newBets = [...(editedData.fourd_bets || [])];
    newBets[index] = { ...newBets[index], [field]: field.includes('amount') ? parseFloat(value) || 0 : value };
    setEditedData({ ...editedData, fourd_bets: newBets });
  };

  const updateTotoEntry = (index, field, value) => {
    const newEntries = [...(editedData.toto_entries || [])];
    if (field === 'numbers') {
      newEntries[index] = { ...newEntries[index], numbers: value };
    } else if (field === 'system_size') {
      newEntries[index] = { ...newEntries[index], system_size: parseInt(value) || 7 };
    } else {
      newEntries[index] = { ...newEntries[index], [field]: value };
    }
    setEditedData({ ...editedData, toto_entries: newEntries });
  };

  const updateTotoNumber = (entryIndex, numIndex, value) => {
    const newEntries = [...(editedData.toto_entries || [])];
    const newNumbers = [...(newEntries[entryIndex].numbers || [])];
    newNumbers[numIndex] = parseInt(value) || 0;
    newEntries[entryIndex] = { 
      ...newEntries[entryIndex], 
      numbers: newNumbers,
      system_size: newNumbers.length // Auto-update system size based on number count
    };
    setEditedData({ ...editedData, toto_entries: newEntries });
  };

  const add4DBet = () => {
    const newBets = [...(editedData.fourd_bets || [])];
    newBets.push({
      number: '',
      entry_type: 'Ordinary',
      big_amount: 1.0,
      small_amount: 1.0
    });
    setEditedData({ ...editedData, fourd_bets: newBets });
  };

  const remove4DBet = (index) => {
    const newBets = [...(editedData.fourd_bets || [])];
    newBets.splice(index, 1);
    setEditedData({ ...editedData, fourd_bets: newBets });
  };

  const addTotoNumber = (entryIndex) => {
    const newEntries = [...(editedData.toto_entries || [])];
    const currentNumbers = newEntries[entryIndex].numbers || [];
    if (currentNumbers.length < 12) {
      const newNumbers = [...currentNumbers, 1];
      newEntries[entryIndex] = { 
        ...newEntries[entryIndex], 
        numbers: newNumbers,
        system_size: newNumbers.length // Auto-update system size
      };
      setEditedData({ ...editedData, toto_entries: newEntries });
    }
  };

  const removeTotoNumber = (entryIndex, numIndex) => {
    const newEntries = [...(editedData.toto_entries || [])];
    const newNumbers = [...(newEntries[entryIndex].numbers || [])];
    newNumbers.splice(numIndex, 1);
    newEntries[entryIndex] = { 
      ...newEntries[entryIndex], 
      numbers: newNumbers,
      system_size: newNumbers.length // Auto-update system size
    };
    setEditedData({ ...editedData, toto_entries: newEntries });
  };

  const addTotoEntry = () => {
    const newEntries = [...(editedData.toto_entries || [])];
    newEntries.push({
      label: String.fromCharCode(65 + newEntries.length),
      numbers: [1, 2, 3, 4, 5, 6],
      bet_type: 'Ordinary',
      system_size: 6,
      system_roll: null
    });
    setEditedData({ ...editedData, toto_entries: newEntries });
  };

  const removeTotoEntry = (index) => {
    const newEntries = [...(editedData.toto_entries || [])];
    newEntries.splice(index, 1);
    setEditedData({ ...editedData, toto_entries: newEntries });
  };

  return (
    <div className="rounded-2xl shadow-2xl p-8 space-y-6" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Verify Ticket Details</h1>
      <p className="text-center" style={{color: '#cbd5e1'}}>Please confirm the extracted information</p>
      
      {/* Game Type */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Game Type</label>
        {isEditing ? (
          <select
            value={game_type || '4D'}
            onChange={(e) => updateGameType(e.target.value)}
            className="w-full px-4 py-3 rounded-lg text-lg font-semibold text-white"
            style={{background: '#1e293b', border: '2px solid #7c3aed', outline: 'none'}}
          >
            <option value="4D">4D</option>
            <option value="TOTO">TOTO</option>
          </select>
        ) : (
          <div className="px-4 py-3 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
            <span className="text-lg font-semibold text-white">{game_type || 'Not detected'}</span>
          </div>
        )}
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
                    {isEditing ? (
                      <input
                        type="text"
                        value={bet.number || ''}
                        onChange={(e) => update4DBet(index, 'number', e.target.value)}
                        maxLength={4}
                        className="font-bold text-3xl text-white bg-transparent border-b-2 border-purple-500 outline-none w-32"
                        style={{letterSpacing: '3px'}}
                      />
                    ) : (
                      <span className="font-bold text-3xl text-white" style={{letterSpacing: '3px'}}>
                        {bet.number || bet.roll_pattern || 'N/A'}
                      </span>
                    )}
                    {bet.entry_type && (
                      <div className="text-xs mt-1" style={{color: '#94a3b8'}}>{bet.entry_type.toUpperCase()}</div>
                    )}
                  </div>

                  {/* 3. Bet Details (BIG/SML with prices) */}
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{color: '#cbd5e1'}}>BIG</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={bet.big_amount || 0}
                          onChange={(e) => update4DBet(index, 'big_amount', e.target.value)}
                          className="w-20 px-2 py-1 rounded text-base font-semibold text-center"
                          style={{background: '#1e293b', color: '#34d399', border: '1px solid #7c3aed'}}
                          step="0.5"
                          min="0"
                        />
                      ) : (
                        <span className="text-base font-semibold" style={{color: '#34d399'}}>${bet.big_amount?.toFixed(2) || '0.00'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold" style={{color: '#cbd5e1'}}>SML</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={bet.small_amount || 0}
                          onChange={(e) => update4DBet(index, 'small_amount', e.target.value)}
                          className="w-20 px-2 py-1 rounded text-base font-semibold text-center"
                          style={{background: '#1e293b', color: '#34d399', border: '1px solid #7c3aed'}}
                          step="0.5"
                          min="0"
                        />
                      ) : (
                        <span className="text-base font-semibold" style={{color: '#34d399'}}>${bet.small_amount?.toFixed(2) || '0.00'}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Remove Button (Edit Mode Only) */}
                  {isEditing && fourd_bets.length > 1 && (
                    <button
                      onClick={() => remove4DBet(index)}
                      className="ml-2 px-2 py-1 rounded text-xs font-semibold transition-colors"
                      style={{background: '#ef4444', color: 'white'}}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={add4DBet}
                  className="w-full py-3 rounded-lg font-semibold transition-all mt-3"
                  style={{background: 'rgba(124, 58, 237, 0.15)', border: '2px dashed #7c3aed', color: '#a78bfa'}}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(124, 58, 237, 0.25)';
                    e.target.style.borderStyle = 'solid';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(124, 58, 237, 0.15)';
                    e.target.style.borderStyle = 'dashed';
                  }}
                >
                  + Add 4D Entry
                </button>
              )}
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
                      <div key={numIndex} className="relative">
                        {isEditing ? (
                          <>
                            <input
                              type="number"
                              value={num}
                              onChange={(e) => updateTotoNumber(index, numIndex, e.target.value)}
                              className="inline-flex items-center justify-center w-12 h-12 font-bold text-lg rounded-full text-center"
                              style={{background: '#1e293b', color: '#f1f5f9', border: '2px solid #7c3aed'}}
                              min="1"
                              max="49"
                            />
                            {entry.numbers.length > 6 && (
                              <button
                                onClick={() => removeTotoNumber(index, numIndex)}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{background: '#ef4444', color: 'white'}}
                              >
                                ×
                              </button>
                            )}
                          </>
                        ) : (
                          <span 
                            className="inline-flex items-center justify-center w-12 h-12 font-bold text-lg rounded-full"
                            style={{background: '#1e293b', color: '#f1f5f9', border: '1px solid #475569'}}
                          >
                            {num}
                          </span>
                        )}
                      </div>
                    ))}
                    {isEditing && entry.numbers.length < 12 && (
                      <button
                        onClick={() => addTotoNumber(index)}
                        className="inline-flex items-center justify-center w-12 h-12 font-bold text-lg rounded-full"
                        style={{background: 'rgba(124, 58, 237, 0.15)', border: '2px dashed #7c3aed', color: '#a78bfa'}}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(124, 58, 237, 0.25)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(124, 58, 237, 0.15)'}
                      >
                        +
                      </button>
                    )}
                  </div>
                  {isEditing && entry.numbers.length >= 7 && (
                    <div className="ml-10 mt-2 text-xs" style={{color: '#94a3b8'}}>
                      System {entry.numbers.length} (Max: 12 numbers)
                    </div>
                  )}
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
                  
                  {/* Remove Entry Button (Edit Mode Only) */}
                  {isEditing && toto_entries.length > 1 && (
                    <div className="ml-10 mt-3">
                      <button
                        onClick={() => removeTotoEntry(index)}
                        className="px-3 py-1 rounded text-xs font-semibold transition-colors"
                        style={{background: '#ef4444', color: 'white'}}
                        onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                        onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                      >
                        Remove Entry
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={addTotoEntry}
                  className="w-full py-3 rounded-lg font-semibold transition-all mt-3"
                  style={{background: 'rgba(124, 58, 237, 0.15)', border: '2px dashed #7c3aed', color: '#a78bfa'}}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(124, 58, 237, 0.25)';
                    e.target.style.borderStyle = 'solid';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(124, 58, 237, 0.15)';
                    e.target.style.borderStyle = 'dashed';
                  }}
                >
                  + Add TOTO Entry
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-4" style={{color: '#94a3b8'}}>No entries found</div>
          )}
        </div>
      </div>

      {/* Draw Date */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Draw Date</label>
        {isEditing ? (
          <input
            type="date"
            value={draw_date || ''}
            onChange={(e) => setEditedData({ ...editedData, draw_date: e.target.value })}
            className="w-full px-4 py-3 rounded-lg text-lg font-semibold text-white"
            style={{background: '#1e293b', border: '2px solid #7c3aed', outline: 'none'}}
          />
        ) : (
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
        )}
      </div>

      {/* Ticket Price - Styled as Result/Sum */}
      {ticket_price !== undefined && (
        <div>
          <label className="block text-sm font-medium mb-2" style={{color: '#64748b'}}>Total Price</label>
          {isEditing ? (
            <input
              type="number"
              value={editedData.ticket_price || 0}
              onChange={(e) => setEditedData({ ...editedData, ticket_price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-4 rounded-lg text-2xl font-bold text-center"
              style={{background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #7c3aed', color: '#10b981'}}
              step="0.50"
              min="0"
            />
          ) : (
            <div className="px-4 py-4 rounded-lg" style={{background: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981'}}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold" style={{color: '#6ee7b7'}}>Final Sum</span>
                <span className="text-2xl font-bold" style={{color: '#10b981'}}>
                  ${ticket_price.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 flex-wrap">
        {!isEditing ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 min-w-[160px] py-3 rounded-lg font-semibold transition-all"
              style={{background: 'rgba(239, 68, 68, 0.12)', border: '2px solid #ef4444', color: '#fecdd3'}}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.18)';
                e.target.style.borderColor = '#f87171';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.12)';
                e.target.style.borderColor = '#ef4444';
              }}
            >
              Delete Ticket
            </button>
            {allowEdit && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex-1 min-w-[160px] py-3 rounded-lg font-semibold transition-all"
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
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 min-w-[160px] py-3 rounded-lg font-semibold transition-all"
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
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 min-w-[160px] py-3 rounded-lg font-semibold transition-all"
              style={{background: 'transparent', border: '2px solid #64748b', color: '#94a3b8'}}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#94a3b8';
                e.target.style.color = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#64748b';
                e.target.style.color = '#94a3b8';
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="flex-1 min-w-[160px] py-3 rounded-lg font-semibold transition-all"
              style={{background: '#10b981', color: 'white', boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'}}
              onMouseEnter={(e) => {
                e.target.style.background = '#059669';
                e.target.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#10b981';
                e.target.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
              }}
            >
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
}
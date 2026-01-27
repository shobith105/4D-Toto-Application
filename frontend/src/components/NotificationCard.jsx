import React from 'react';

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const { id, type, title, message, data, is_read, created_at } = notification;

  // Parse the data field if it exists
  const parsedData = data ? (typeof data === 'string' ? JSON.parse(data) : data) : {};

  // Determine card styling with left accent strip
  const getCardStyle = () => {
    if (type === 'win') {
      return {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderLeft: '4px solid #10b981',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
      };
    } else if (type === 'loss') {
      return {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderLeft: '4px solid #ef4444',
        boxShadow: 'none'
      };
    } else if (type === 'draw_announcement') {
      return {
        background: '#0f172a',
        border: '1px solid #1e293b',
        borderLeft: '4px solid #7c3aed',
        boxShadow: 'none'
      };
    }
    return {
      background: '#0f172a',
      border: '1px solid #1e293b',
      borderLeft: '4px solid #64748b',
      boxShadow: 'none'
    };
  };

  // Get icon based on notification type
  const getIcon = () => {
    if (type === 'win') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{color: '#10b981'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (type === 'loss') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{color: '#ef4444'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (type === 'draw_announcement') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{color: '#7c3aed'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" style={{color: '#7c3aed'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };


  // Render winning card (celebration mode - reordered)
  const renderWinningCard = () => (
    <div className="rounded-lg p-6 transition-all relative" style={{...getCardStyle(), opacity: is_read ? 0.8 : 1}}>
      {/* Unread indicator & Action Icons in Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {!is_read && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkAsRead && onMarkAsRead(id); }}
            className="p-2 rounded-lg transition-all"
            style={{background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.3)'}}
            title="Mark as read"
          >
            <svg className="w-5 h-5" style={{color: '#a78bfa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            className="p-2 rounded-lg transition-all"
            style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)'}}
            title="Delete"
          >
            <svg className="w-5 h-5" style={{color: '#f87171'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-start gap-3 md:gap-4 mb-6">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0 pr-16 md:pr-24">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{title}</h3>
          <p style={{color: '#cbd5e1'}} className="text-sm md:text-base">{message}</p>
        </div>
      </div>

      {/* 1. CELEBRATION SECTION - Prize Amount First! */}
      {(parsedData.prize_amount || parsedData.total_payout) && (
        <div className="mb-6 p-4 md:p-6 rounded-xl text-center" style={{background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
          <div className="text-xs md:text-sm font-semibold mb-2" style={{color: '#6ee7b7'}}>🎉 Congratulations!</div>
          <div className="text-3xl md:text-5xl font-bold mb-1" style={{color: '#10b981'}}>
            ${(parsedData.prize_amount || parsedData.total_payout).toLocaleString()}
          </div>
          <div className="text-xs md:text-sm" style={{color: '#94a3b8'}}>Total Winnings</div>
        </div>
      )}

      {/* 2. YOUR WINNING NUMBERS - Moved Up! */}
      {parsedData.draw_winning_numbers?.your_matches && parsedData.draw_winning_numbers.your_matches.length > 0 && (
        <div className="mb-6 p-5 rounded-xl" style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
          <div className="text-base font-bold mb-4" style={{color: '#10b981'}}>✨ Your Winning Numbers</div>
          <div className="space-y-3">
            {parsedData.draw_winning_numbers.your_matches.map((match, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{background: 'rgba(16, 185, 129, 0.15)'}}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{color: '#10b981', fontFamily: 'monospace'}}>{match.number}</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase" style={{background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7'}}>
                    {match.category}
                  </span>
                </div>
                <span className="text-xl font-bold" style={{color: '#10b981'}}>${match.payout.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Winning Combinations (TOTO) */}
      {parsedData.winning_combos && Array.isArray(parsedData.winning_combos) && parsedData.winning_combos.length > 0 && (
        <div className="mb-6 p-5 rounded-xl" style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
          <div className="text-base font-bold mb-4" style={{color: '#10b981'}}>✨ Your Winning Combinations</div>
          <div className="space-y-3">
            {parsedData.winning_combos.map((combo, idx) => (
              <div key={idx} className="p-3 rounded-lg" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{color: '#94a3b8'}}>
                    Prize Group {combo.prize_group} • {combo.main_matches} matches
                    {combo.has_additional && ' + Additional'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {combo.combination && combo.combination.map((num, numIdx) => (
                    <span
                      key={numIdx}
                      className="inline-flex items-center justify-center w-10 h-10 font-bold text-base rounded-full"
                      style={{background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '2px solid rgba(16, 185, 129, 0.4)'}}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Info Grid */}
      <div className="mb-6 p-4 rounded-lg" style={{background: '#1e293b'}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {parsedData.game_type && (
            <div>
              <span style={{color: '#64748b'}}>Game Type:</span>
              <span className="ml-2 text-white font-semibold">{parsedData.game_type}</span>
            </div>
          )}
          {parsedData.draw_date && (
            <div>
              <span style={{color: '#64748b'}}>Draw Date:</span>
              <span className="ml-2 text-white font-semibold">{parsedData.draw_date}</span>
            </div>
          )}
          {parsedData.draw_no && (
            <div>
              <span style={{color: '#64748b'}}>Draw Number:</span>
              <span className="ml-2 text-white font-semibold">#{parsedData.draw_no}</span>
            </div>
          )}
          {parsedData.prize_group && (
            <div>
              <span style={{color: '#64748b'}}>Prize Group:</span>
              <span className="ml-2 font-semibold" style={{color: '#a78bfa'}}>Group {parsedData.prize_group}</span>
            </div>
          )}
          {parsedData.winning_combinations && (
            <div>
              <span style={{color: '#64748b'}}>Winning Combinations:</span>
              <span className="ml-2 font-bold" style={{color: '#10b981'}}>{parsedData.winning_combinations}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. YOUR TICKET NUMBERS */}
      {renderTicketNumbers()}

      {/* 4. DRAW WINNING NUMBERS with Gold Highlight */}
      {renderDrawWinningNumbers(true)}

      {/* Footer */}
      <div className="mt-6 pt-4" style={{borderTop: '1px solid #334155'}}>
        <span className="text-sm" style={{color: '#64748b'}}>{formatDate(created_at)}</span>
      </div>
    </div>
  );

  // Render losing card (informative, not punishing)
  const renderLosingCard = () => (
    <div className="rounded-lg p-6 transition-all relative" style={{...getCardStyle(), opacity: is_read ? 0.8 : 1}}>
      {/* Action Icons in Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {!is_read && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkAsRead && onMarkAsRead(id); }}
            className="p-2 rounded-lg transition-all"
            style={{background: 'rgba(100, 116, 139, 0.2)', border: '1px solid rgba(100, 116, 139, 0.3)'}}
            title="Mark as read"
          >
            <svg className="w-5 h-5" style={{color: '#94a3b8'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            className="p-2 rounded-lg transition-all"
            style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)'}}
            title="Delete"
          >
            <svg className="w-5 h-5" style={{color: '#f87171'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-start gap-3 md:gap-4 mb-6">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0 pr-16 md:pr-24">
          <h3 className="text-lg md:text-xl font-bold text-white mb-1">{title}</h3>
          <p style={{color: '#94a3b8'}} className="text-xs md:text-sm">{message}</p>
        </div>
      </div>

      {/* Basic Info Grid */}
      <div className="mb-6 p-4 rounded-lg" style={{background: '#1e293b'}}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {parsedData.game_type && (
            <div>
              <span style={{color: '#64748b'}}>Game Type:</span>
              <span className="ml-2 text-white font-semibold">{parsedData.game_type}</span>
            </div>
          )}
          {parsedData.draw_date && (
            <div>
              <span style={{color: '#64748b'}}>Draw Date:</span>
              <span className="ml-2 text-white font-semibold">{parsedData.draw_date}</span>
            </div>
          )}
          {parsedData.draw_no && (
            <div>
              <span style={{color: '#64748b'}}>Draw Number:</span>
              <span className="ml-2 text-white font-semibold">#{parsedData.draw_no}</span>
            </div>
          )}
        </div>
      </div>

      {/* YOUR NUMBERS - Compact Grid */}
      {renderTicketNumbers()}

      {/* DRAW WINNING NUMBERS - Compact Grid */}
      {renderDrawWinningNumbers(false)}

      {/* Footer */}
      <div className="mt-6 pt-4" style={{borderTop: '1px solid #334155'}}>
        <span className="text-sm" style={{color: '#64748b'}}>{formatDate(created_at)}</span>
      </div>
    </div>
  );

  // Helper: Render ticket numbers
  const renderTicketNumbers = () => {
    if (!parsedData.ticket_numbers || !Array.isArray(parsedData.ticket_numbers) || parsedData.ticket_numbers.length === 0) {
      return null;
    }

    return (
      <div className="mb-6 p-4 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
        <div className="text-sm font-semibold mb-3" style={{color: '#cbd5e1'}}>
          {type === 'loss' ? 'Your Numbers' : 'Your Ticket Numbers'}
        </div>
        <div className="space-y-3">
          {parsedData.game_type === 'TOTO' ? (
            parsedData.ticket_numbers.map((entry, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-wrap">
                {entry.label && (
                  <span style={{color: '#94a3b8'}} className="font-medium min-w-[20px]">{entry.label}.</span>
                )}
                <div className="flex flex-wrap gap-2">
                  {entry.numbers && entry.numbers.map((num, numIdx) => (
                    <span
                      key={numIdx}
                      className="inline-flex items-center justify-center w-9 h-9 font-bold text-sm rounded-full"
                      style={{background: '#0f172a', color: '#f1f5f9', border: '1px solid #475569'}}
                    >
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : parsedData.game_type === '4D' ? (
            <div className="flex flex-wrap gap-3">
              {parsedData.ticket_numbers.map((bet, idx) => {
                const betNumber = typeof bet === 'string' ? bet : bet.number;
                const betType = typeof bet === 'object' ? (bet.bet_type || bet.entry_type || 'Ordinary') : 'Ordinary';
                
                return (
                  <div key={idx} className="rounded-lg px-3 py-2" style={{background: '#0f172a', border: '1px solid #475569'}}>
                    <div className="text-xs mb-1" style={{color: '#94a3b8'}}>{betType}</div>
                    <div className="text-lg font-bold tracking-wider text-white">{betNumber}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Helper: Render draw winning numbers
  const renderDrawWinningNumbers = (isWin) => {
    if (!parsedData.draw_winning_numbers) return null;

    return (
      <div className="mb-4 p-4 rounded-lg" style={{background: '#1e293b', border: '1px solid #334155'}}>
        <div className="text-sm font-semibold mb-3" style={{color: '#cbd5e1'}}>
          {type === 'loss' ? 'Winning Numbers (This Draw)' : 'Draw Winning Numbers'}
        </div>
        
        {parsedData.game_type === 'TOTO' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs mb-2" style={{color: '#94a3b8'}}>Main Numbers</div>
              <div className="flex flex-wrap gap-2">
                {parsedData.draw_winning_numbers.winning_numbers && 
                  parsedData.draw_winning_numbers.winning_numbers.map((num, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center justify-center w-10 h-10 font-bold text-base rounded-full"
                      style={{background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '2px solid rgba(59, 130, 246, 0.3)'}}
                    >
                      {num}
                    </span>
                  ))
                }
              </div>
            </div>
            {parsedData.draw_winning_numbers.additional_number && (
              <div>
                <div className="text-xs mb-2" style={{color: '#94a3b8'}}>Additional Number</div>
                <span className="inline-flex items-center justify-center w-10 h-10 font-bold text-base rounded-full"
                  style={{background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '2px solid rgba(251, 191, 36, 0.3)'}}>
                  {parsedData.draw_winning_numbers.additional_number}
                </span>
              </div>
            )}
          </div>
        )}

        {parsedData.game_type === '4D' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {parsedData.draw_winning_numbers.first && (
                <div className="rounded-lg p-3" style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)',
                  border: isWin ? '2px solid #fbbf24' : '1px solid rgba(251, 191, 36, 0.3)'
                }}>
                  <div className="text-xs mb-1 font-semibold" style={{color: '#fbbf24'}}>1st Prize</div>
                  <div className="text-xl font-bold tracking-wider" style={{color: '#fde68a'}}>{parsedData.draw_winning_numbers.first}</div>
                </div>
              )}
              {parsedData.draw_winning_numbers.second && (
                <div className="rounded-lg p-3" style={{
                  background: 'rgba(203, 213, 225, 0.1)',
                  border: '1px solid rgba(203, 213, 225, 0.2)'
                }}>
                  <div className="text-xs mb-1 font-semibold" style={{color: '#cbd5e1'}}>2nd Prize</div>
                  <div className="text-xl font-bold tracking-wider text-white">{parsedData.draw_winning_numbers.second}</div>
                </div>
              )}
              {parsedData.draw_winning_numbers.third && (
                <div className="rounded-lg p-3" style={{
                  background: 'rgba(251, 146, 60, 0.1)',
                  border: '1px solid rgba(251, 146, 60, 0.3)'
                }}>
                  <div className="text-xs mb-1 font-semibold" style={{color: '#fb923c'}}>3rd Prize</div>
                  <div className="text-xl font-bold tracking-wider" style={{color: '#fdba74'}}>{parsedData.draw_winning_numbers.third}</div>
                </div>
              )}
            </div>
            
            {/* Starter Prizes - Compact 6 per row */}
            {parsedData.draw_winning_numbers.starter && parsedData.draw_winning_numbers.starter.length > 0 && (
              <div>
                <div className="text-xs mb-2" style={{color: '#94a3b8'}}>Starter Prizes</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {parsedData.draw_winning_numbers.starter.map((num, idx) => (
                    <span key={idx} className="inline-flex items-center justify-center px-2 py-1 font-mono text-xs rounded"
                      style={{background: '#0f172a', color: '#cbd5e1', border: '1px solid #475569'}}>
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Consolation Prizes - Compact 6 per row */}
            {parsedData.draw_winning_numbers.consolation && parsedData.draw_winning_numbers.consolation.length > 0 && (
              <div>
                <div className="text-xs mb-2" style={{color: '#94a3b8'}}>Consolation Prizes</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {parsedData.draw_winning_numbers.consolation.map((num, idx) => (
                    <span key={idx} className="inline-flex items-center justify-center px-2 py-1 font-mono text-xs rounded"
                      style={{background: '#0f172a', color: '#cbd5e1', border: '1px solid #475569'}}>
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Main return - route to correct card type
  if (type === 'win') {
    return renderWinningCard();
  } else if (type === 'loss') {
    return renderLosingCard();
  }

  // Default card for other types
  return (
    <div className="rounded-lg p-6 transition-all relative" style={{...getCardStyle(), opacity: is_read ? 0.8 : 1}}>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {!is_read && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkAsRead && onMarkAsRead(id); }}
            className="p-2 rounded-lg transition-all"
            style={{background: 'rgba(124, 58, 237, 0.2)', border: '1px solid rgba(124, 58, 237, 0.3)'}}
            title="Mark as read"
          >
            <svg className="w-5 h-5" style={{color: '#a78bfa'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(id); }}
            className="p-2 rounded-lg transition-all"
            style={{background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.3)'}}
            title="Delete"
          >
            <svg className="w-5 h-5" style={{color: '#f87171'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0 pr-24">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p style={{color: '#cbd5e1'}} className="mb-4">{message}</p>

          {parsedData && Object.keys(parsedData).length > 0 && (
            <div className="p-4 rounded-lg" style={{background: '#1e293b'}}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {parsedData.game_type && (
                  <div>
                    <span style={{color: '#64748b'}}>Game Type:</span>
                    <span className="ml-2 text-white font-semibold">{parsedData.game_type}</span>
                  </div>
                )}
                {parsedData.draw_date && (
                  <div>
                    <span style={{color: '#64748b'}}>Draw Date:</span>
                    <span className="ml-2 text-white font-semibold">{parsedData.draw_date}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 pt-4" style={{borderTop: '1px solid #334155'}}>
            <span className="text-sm" style={{color: '#64748b'}}>{formatDate(created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;

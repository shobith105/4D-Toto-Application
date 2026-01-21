import React from 'react';

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const { id, type, title, message, data, is_read, created_at } = notification;

  // Parse the data field if it exists
  const parsedData = data ? (typeof data === 'string' ? JSON.parse(data) : data) : {};

  // Determine card styling based on notification type and win/loss
  const getCardStyle = () => {
    if (type === 'win') {
      return 'border-green-500/50 bg-green-900/20';
    } else if (type === 'loss') {
      return 'border-red-500/50 bg-red-900/20';
    } else if (type === 'draw_announcement') {
      return 'border-blue-500/50 bg-blue-900/20';
    }
    return 'border-slate-700 bg-slate-800/50';
  };

  // Get icon based on notification type
  const getIcon = () => {
    if (type === 'win') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (type === 'loss') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (type === 'draw_announcement') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-fuchsia-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  return (
    <div
      className={`relative rounded-lg border ${getCardStyle()} p-6 transition-all hover:shadow-lg ${
        is_read ? 'opacity-75' : 'opacity-100'
      }`}
    >
      {/* Unread indicator */}
      {!is_read && (
        <div className="absolute top-4 right-4">
          <div className="h-3 w-3 rounded-full bg-fuchsia-500 animate-pulse"></div>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-xl font-bold text-slate-100 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-slate-300 mb-4">{message}</p>

          {/* Additional data if present */}
          {parsedData && Object.keys(parsedData).length > 0 && (
            <div className="bg-slate-900/50 rounded-md p-4 mb-4 border border-slate-700">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {parsedData.game_type && (
                  <div>
                    <span className="text-slate-400">Game Type:</span>
                    <span className="ml-2 text-slate-200 font-semibold">{parsedData.game_type}</span>
                  </div>
                )}
                {parsedData.draw_date && (
                  <div>
                    <span className="text-slate-400">Draw Date:</span>
                    <span className="ml-2 text-slate-200 font-semibold">{parsedData.draw_date}</span>
                  </div>
                )}
                {parsedData.draw_no && (
                  <div>
                    <span className="text-slate-400">Draw Number:</span>
                    <span className="ml-2 text-slate-200 font-semibold">#{parsedData.draw_no}</span>
                  </div>
                )}
                {(parsedData.prize_amount || parsedData.total_payout) && (
                  <div>
                    <span className="text-slate-400">Prize Amount:</span>
                    <span className="ml-2 text-green-400 font-semibold">
                      ${parsedData.prize_amount || parsedData.total_payout}
                    </span>
                  </div>
                )}
                {parsedData.prize_group && (
                  <div>
                    <span className="text-slate-400">Prize Group:</span>
                    <span className="ml-2 text-fuchsia-400 font-semibold">Group {parsedData.prize_group}</span>
                  </div>
                )}
                {parsedData.winning_combinations && (
                  <div>
                    <span className="text-slate-400">Winning Combinations:</span>
                    <span className="ml-2 text-green-400 font-semibold">{parsedData.winning_combinations}</span>
                  </div>
                )}
              </div>

              {/* Ticket Numbers - Display for both wins and losses */}
              {parsedData.ticket_numbers && Array.isArray(parsedData.ticket_numbers) && parsedData.ticket_numbers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-sm mb-3 font-semibold">
                    {type === 'loss' ? 'Your Numbers:' : 'Your Ticket Numbers:'}
                  </div>
                  <div className="space-y-3">
                    {parsedData.game_type === 'TOTO' ? (
                      // TOTO format
                      parsedData.ticket_numbers.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {entry.label && (
                            <span className="text-slate-500 font-medium min-w-[20px]">{entry.label}.</span>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {entry.numbers && entry.numbers.map((num, numIdx) => (
                              <span
                                key={numIdx}
                                className={`inline-flex items-center justify-center w-8 h-8 font-semibold text-sm rounded border ${
                                  type === 'loss' 
                                    ? 'bg-slate-800/70 text-slate-400 border-slate-600' 
                                    : 'bg-slate-800 text-slate-200 border-slate-600'
                                }`}
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : parsedData.game_type === '4D' ? (
                      // 4D format
                      <div className="flex flex-wrap gap-2">
                        {parsedData.ticket_numbers.map((bet, idx) => {
                          // Handle both formats: {number, bet_type} or just string
                          const betNumber = typeof bet === 'string' ? bet : bet.number;
                          const betType = typeof bet === 'object' ? (bet.bet_type || bet.entry_type || 'Ordinary') : 'Ordinary';
                          
                          return (
                            <div key={idx} className={`rounded-lg px-3 py-2 border ${
                              type === 'loss'
                                ? 'bg-slate-800/70 border-slate-600'
                                : 'bg-slate-800/50 border-slate-600'
                            }`}>
                              <div className="text-xs text-slate-500 mb-1">{betType}</div>
                              <div className={`text-lg font-bold tracking-wider ${
                                type === 'loss' ? 'text-slate-400' : 'text-slate-200'
                              }`}>{betNumber}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              )}

              {/* Draw Winning Numbers - Display for both wins and losses */}
              {parsedData.draw_winning_numbers && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-sm mb-3 font-semibold">
                    {type === 'loss' ? 'Winning Numbers (This Draw):' : 'Draw Winning Numbers:'}
                  </div>
                  
                  {parsedData.game_type === 'TOTO' && (
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-500 mb-2">Main Numbers</div>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.draw_winning_numbers.winning_numbers && 
                            parsedData.draw_winning_numbers.winning_numbers.map((num, idx) => (
                              <span
                                key={idx}
                                className={`inline-flex items-center justify-center w-10 h-10 font-bold text-base rounded-full border-2 ${
                                  type === 'loss'
                                    ? 'bg-blue-500/10 text-blue-400/70 border-blue-500/30'
                                    : 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                                }`}
                              >
                                {num}
                              </span>
                            ))
                          }
                        </div>
                      </div>
                      {parsedData.draw_winning_numbers.additional_number && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Additional Number</div>
                          <span className={`inline-flex items-center justify-center w-10 h-10 font-bold text-base rounded-full border-2 ${
                            type === 'loss'
                              ? 'bg-amber-500/10 text-amber-400/70 border-amber-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          }`}>
                            {parsedData.draw_winning_numbers.additional_number}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {parsedData.game_type === '4D' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        {parsedData.draw_winning_numbers.first && (
                          <div className={`rounded-lg p-3 border ${
                            type === 'loss'
                              ? 'bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border-yellow-500/30'
                              : 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/50'
                          }`}>
                            <div className={`text-xs mb-1 font-semibold ${
                              type === 'loss' ? 'text-yellow-300/70' : 'text-yellow-300'
                            }`}>1st Prize</div>
                            <div className={`text-2xl font-bold tracking-wider ${
                              type === 'loss' ? 'text-yellow-200/70' : 'text-yellow-200'
                            }`}>{parsedData.draw_winning_numbers.first}</div>
                          </div>
                        )}
                        {parsedData.draw_winning_numbers.second && (
                          <div className={`rounded-lg p-3 border ${
                            type === 'loss'
                              ? 'bg-gradient-to-br from-slate-400/10 to-slate-500/10 border-slate-400/30'
                              : 'bg-gradient-to-br from-slate-400/20 to-slate-500/20 border-slate-400/50'
                          }`}>
                            <div className={`text-xs mb-1 font-semibold ${
                              type === 'loss' ? 'text-slate-300/70' : 'text-slate-300'
                            }`}>2nd Prize</div>
                            <div className={`text-2xl font-bold tracking-wider ${
                              type === 'loss' ? 'text-slate-200/70' : 'text-slate-200'
                            }`}>{parsedData.draw_winning_numbers.second}</div>
                          </div>
                        )}
                        {parsedData.draw_winning_numbers.third && (
                          <div className={`rounded-lg p-3 border ${
                            type === 'loss'
                              ? 'bg-gradient-to-br from-orange-600/10 to-orange-700/10 border-orange-600/30'
                              : 'bg-gradient-to-br from-orange-600/20 to-orange-700/20 border-orange-600/50'
                          }`}>
                            <div className={`text-xs mb-1 font-semibold ${
                              type === 'loss' ? 'text-orange-300/70' : 'text-orange-300'
                            }`}>3rd Prize</div>
                            <div className={`text-2xl font-bold tracking-wider ${
                              type === 'loss' ? 'text-orange-200/70' : 'text-orange-200'
                            }`}>{parsedData.draw_winning_numbers.third}</div>
                          </div>
                        )}
                      </div>
                      
                      {parsedData.draw_winning_numbers.starter && parsedData.draw_winning_numbers.starter.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Starter Prizes</div>
                          <div className="flex flex-wrap gap-2">
                            {parsedData.draw_winning_numbers.starter.map((num, idx) => (
                              <span key={idx} className={`inline-flex items-center justify-center px-2 py-1 font-mono text-sm rounded border ${
                                type === 'loss'
                                  ? 'bg-slate-800/30 text-slate-400 border-slate-600/50'
                                  : 'bg-slate-800/50 text-slate-300 border-slate-600'
                              }`}>
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {parsedData.draw_winning_numbers.consolation && parsedData.draw_winning_numbers.consolation.length > 0 && (
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Consolation Prizes</div>
                          <div className="flex flex-wrap gap-2">
                            {parsedData.draw_winning_numbers.consolation.map((num, idx) => (
                              <span key={idx} className={`inline-flex items-center justify-center px-2 py-1 font-mono text-sm rounded border ${
                                type === 'loss'
                                  ? 'bg-slate-800/30 text-slate-400 border-slate-600/50'
                                  : 'bg-slate-800/50 text-slate-300 border-slate-600'
                              }`}>
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedData.draw_winning_numbers.your_matches && parsedData.draw_winning_numbers.your_matches.length > 0 && (
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30 mt-3">
                          <div className="text-sm text-green-300 font-semibold mb-2">🎉 Your Winning Numbers:</div>
                          <div className="space-y-2">
                            {parsedData.draw_winning_numbers.your_matches.map((match, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl font-bold text-green-200 tracking-wider">{match.number}</span>
                                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-semibold uppercase">
                                    {match.category}
                                  </span>
                                </div>
                                <span className="text-green-300 font-bold">${match.payout}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Winning Combinations (TOTO) */}
              {parsedData.winning_combos && Array.isArray(parsedData.winning_combos) && parsedData.winning_combos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-sm mb-3 font-semibold">Your Winning Combinations:</div>
                  <div className="space-y-3">
                    {parsedData.winning_combos.map((combo, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-slate-500">
                            Prize Group {combo.prize_group} • {combo.main_matches} matches
                            {combo.has_additional && ' + Additional'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {combo.combination && combo.combination.map((num, numIdx) => (
                            <span
                              key={numIdx}
                              className="inline-flex items-center justify-center w-10 h-10 bg-green-500/20 text-green-300 font-bold text-base rounded border border-green-500/50"
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
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{formatDate(created_at)}</span>
            <div className="flex gap-2">
              {!is_read && onMarkAsRead && (
                <button
                  onClick={() => onMarkAsRead(id)}
                  className="text-sm px-4 py-2 bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 rounded-md transition-colors border border-fuchsia-500/30 hover:border-fuchsia-500/50"
                >
                  Mark as Read
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(id)}
                  className="text-sm px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-md transition-colors border border-red-500/30 hover:border-red-500/50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;

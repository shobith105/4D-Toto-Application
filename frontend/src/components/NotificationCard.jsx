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

              {/* Ticket Numbers - TOTO format with entries */}
              {parsedData.ticket_numbers && Array.isArray(parsedData.ticket_numbers) && parsedData.ticket_numbers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-sm mb-3">Your Numbers:</div>
                  <div className="space-y-3">
                    {parsedData.ticket_numbers.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {entry.label && (
                          <span className="text-slate-500 font-medium min-w-[20px]">{entry.label}.</span>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {entry.numbers && entry.numbers.map((num, numIdx) => (
                            <span
                              key={numIdx}
                              className="inline-flex items-center justify-center w-8 h-8 bg-slate-800 text-slate-200 font-semibold text-sm rounded border border-slate-600"
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

              {/* Winning Numbers */}
              {parsedData.winning_combos && Array.isArray(parsedData.winning_combos) && parsedData.winning_combos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <div className="text-slate-400 text-sm mb-3">Your Winning Combinations:</div>
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

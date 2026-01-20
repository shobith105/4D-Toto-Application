import React from 'react';

export default function LoadingSpinner({ message = "Processing..." }) {
  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700 max-w-sm mx-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Ticket Icon */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 animate-spin-slow">
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="url(#gradient1)"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="70 200"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d946ef" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Middle pulsing ring */}
            <div className="absolute inset-0 animate-pulse">
              <svg className="w-24 h-24" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="#a855f7"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.4"
                />
              </svg>
            </div>

            {/* Center ticket icon */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-fuchsia-400 animate-bounce-slow" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" 
                />
              </svg>
            </div>
          </div>

          {/* Loading Text */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-2">{message}</h3>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-purple-500 animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

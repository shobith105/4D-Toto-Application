import React from 'react';

export default function LoadingSpinner({ message = "Analyzing Ticket..." }) {
  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center"
      style={{background: 'rgba(2, 6, 23, 0.9)'}}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Dual Orbit Spinner */}
        <div 
          className="relative"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: '4px solid rgba(30, 41, 59, 0.5)'
          }}
        >
          {/* Outer Ring (Violet - Tech) - Spins Clockwise */}
          <div
            style={{
              content: '""',
              position: 'absolute',
              top: '-4px',
              left: '-4px',
              right: '-4px',
              bottom: '-4px',
              borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: '#7c3aed',
              borderRightColor: '#7c3aed',
              animation: 'spin-cw 1.5s linear infinite',
              filter: 'drop-shadow(0 0 4px rgba(124, 58, 237, 0.5))'
            }}
          />
          
          {/* Inner Ring (Green - Luck) - Spins Counter-Clockwise */}
          <div
            style={{
              content: '""',
              position: 'absolute',
              top: '6px',
              left: '6px',
              right: '6px',
              bottom: '6px',
              borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: '#10b981',
              borderLeftColor: '#10b981',
              animation: 'spin-ccw 2s linear infinite',
              filter: 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.5))'
            }}
          />
        </div>

        {/* Pulsing Text */}
        <p 
          className="font-medium text-base"
          style={{
            color: '#94a3b8',
            animation: 'pulse-text 2s ease-in-out infinite',
            letterSpacing: '0.5px'
          }}
        >
          {message}
        </p>
      </div>
      
      <style jsx>{`
        @keyframes spin-cw {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-ccw {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }

        @keyframes pulse-text {
          0%, 100% { 
            opacity: 0.6; 
          }
          50% { 
            opacity: 1; 
            color: #c4b5fd;
          }
        }
      `}</style>
    </div>
  );
}

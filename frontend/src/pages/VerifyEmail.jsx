import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{backgroundColor: '#020617'}}>
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-xl mb-4" style={{background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)'}}>
            <svg className="w-9 h-9" style={{color: '#7c3aed'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">TicketSense</h1>
          <p className="text-sm mt-2" style={{color: '#cbd5e1'}}>4D & TOTO Dashboard</p>
        </div>

        <div className="rounded-2xl shadow-2xl p-10 text-center" style={{background: '#0f172a', border: '1px solid #1e293b'}}>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full mb-6" style={{background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
            <svg className="w-8 h-8" style={{color: '#10b981'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-white mb-4">Check Your Email</h2>
          
          <p className="mb-6" style={{color: '#cbd5e1'}}>
            We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
          </p>

          <div className="rounded-lg p-4 mb-6" style={{background: 'rgba(124, 58, 237, 0.1)', border: '1px solid rgba(124, 58, 237, 0.2)'}}>
            <p className="text-sm" style={{color: '#94a3b8'}}>
              Didn&apos;t receive the email? Check your spam folder or contact support.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-lg font-semibold transition-all"
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
            Back to Sign In
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{color: '#64748b'}}>
          For entertainment and learning purposes only
        </p>
      </div>
    </div>
  );
}
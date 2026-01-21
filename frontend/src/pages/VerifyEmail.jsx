import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VerifyEmail() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">TicketSense</h1>
          <p className="text-sm text-white/90 mt-1">4D & TOTO Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-black mb-4">Check Your Email</h2>
          
          <p className="text-white/70 mb-6">
            We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
          </p>

          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-sm text-white/70">
              Didn&apos;t receive the email? Check your spam folder or contact support.
            </p>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Back to Sign In
          </button>
        </div>

        <p className="text-center text-xs text-white/80 mt-6">
          For entertainment and learning purposes only
        </p>
      </div>
    </div>
  );
}
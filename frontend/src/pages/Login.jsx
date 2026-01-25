import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        navigate('/home');
      }
    } catch (error) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Login Card with Glassmorphism */}
        <div className="rounded-2xl shadow-2xl p-8 backdrop-blur-xl" style={{background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #1e293b', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'}}>
          <h2 className="text-2xl text-center font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm font-semibold" style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{color: '#94a3b8'}}>
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg text-white transition-all"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{color: '#94a3b8'}}>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg text-white transition-all"
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#7c3aed'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
              <div className="text-right mt-2">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs font-medium transition-colors"
                  style={{color: '#94a3b8'}}
                  onMouseEnter={(e) => e.target.style.color = '#cbd5e1'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                  type="button"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold transition-all"
              style={{
                background: loading ? '#64748b' : '#7c3aed',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 20px rgba(124, 58, 237, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.background = '#6d28d9';
                  e.target.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.background = '#7c3aed';
                  e.target.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.3)';
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{color: '#94a3b8'}}>
              Don&apos;t have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-semibold transition-colors"
                style={{color: '#7c3aed'}}
                onMouseEnter={(e) => e.target.style.color = '#6d28d9'}
                onMouseLeave={(e) => e.target.style.color = '#7c3aed'}
                type="button"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{color: '#64748b'}}>
          For entertainment and learning purposes only
        </p>
      </div>
    </div>
  );
}

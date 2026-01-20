import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import supabase from '../services/supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <nav className="bg-slate-900 border-b border-fuchsia-500/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-fuchsia-500">M</span>
            <span className="text-lg font-semibold text-slate-200">Merlion Metrics</span>
          </div>
          <ul className="flex items-center space-x-6">
            <li>
              <Link to="/dashboard" className="text-slate-300 hover:text-fuchsia-500 transition-colors">Dashboard</Link>
            </li>
            <li>
              <Link to="/home" className="text-slate-300 hover:text-fuchsia-500 transition-colors">Upload Ticket</Link>
            </li>
            <li>
              <Link to="/details" className="text-slate-300 hover:text-fuchsia-500 transition-colors">View Past Tickets</Link>
            </li>
            <li>
              <Link to="/notifications" className="text-slate-300 hover:text-fuchsia-500 transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notifications
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-600 text-slate-200 rounded-lg transition-colors border border-slate-700 hover:border-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

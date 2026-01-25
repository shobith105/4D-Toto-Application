import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import supabase from '../services/supabaseClient';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
      setUnreadCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

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

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className="sticky top-0 z-50 backdrop-blur-lg"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderBottom: '1px solid #1e293b',
        height: '72px'
      }}
    >
      <div className="px-8 h-full flex items-center justify-between">
        {/* Brand Section */}
        <div className="flex items-center gap-3">
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center backdrop-blur-xl"
            style={{
              background: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)'
            }}
          >
            <svg className="w-6 h-6" style={{color: '#7c3aed'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">TicketSense</span>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-px" style={{backgroundColor: '#1e293b'}}></div>

        {/* Main Navigation */}
        <div className="flex items-center gap-2 flex-1 ml-6">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              color: isActive('/dashboard') ? '#c4b5fd' : '#94a3b8',
              backgroundColor: isActive('/dashboard') ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
              border: isActive('/dashboard') ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/dashboard')) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          <Link 
            to="/home" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              color: isActive('/home') ? '#c4b5fd' : '#94a3b8',
              backgroundColor: isActive('/home') ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
              border: isActive('/home') ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/home')) {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/home')) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </Link>

          <Link 
            to="/details" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              color: isActive('/details') ? '#c4b5fd' : '#94a3b8',
              backgroundColor: isActive('/details') ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
              border: isActive('/details') ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/details')) {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/details')) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            History
          </Link>

          <Link 
            to="/notifications" 
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{
              color: isActive('/notifications') ? '#c4b5fd' : '#94a3b8',
              backgroundColor: isActive('/notifications') ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
              border: isActive('/notifications') ? '1px solid rgba(124, 58, 237, 0.2)' : '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!isActive('/notifications')) {
                e.currentTarget.style.color = '#f8fafc';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive('/notifications')) {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
            {/* Unread Badge */}
            {unreadCount > 0 && (
              <span 
                className="absolute -top-1 -right-1 flex items-center justify-center text-xs font-bold text-white rounded-full"
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: '#ef4444',
                  border: '2px solid #0f172a'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
        </div>

        {/* User Actions (Right Side) */}
        <div 
          className="flex items-center gap-4 pl-6"
          style={{borderLeft: '1px solid #1e293b'}}
        >

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              color: '#ef4444',
              border: '1px solid #334155',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#334155';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

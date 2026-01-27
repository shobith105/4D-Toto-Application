import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white" style={{backgroundColor: '#020617'}}>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-3">Welcome to Your Dashboard</h1>
          <p className="text-base md:text-lg" style={{color: '#cbd5e1'}}>
            Manage your tickets and track your luck
          </p>
        </div>

        {/* Quick Actions - Improved Cards */}
        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl w-full">
          {/* Upload Card with Emerald Accent */}
          <div
            onClick={() => navigate('/upload')}
            className="rounded-xl p-5 md:p-6 cursor-pointer group transition-all duration-300"
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#10b981';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e293b';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
            }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center" style={{background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" style={{color: '#10b981'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">Upload New Ticket</h2>
                <p style={{color: '#94a3b8', fontSize: '0.85rem'}} className="md:text-base">Scan and analyze your lottery tickets</p>
              </div>
              <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" style={{color: '#64748b'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* View Tickets Card with Violet Accent */}
          <div
            onClick={() => navigate('/details')}
            className="rounded-xl p-5 md:p-6 cursor-pointer group transition-all duration-300"
            style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#7c3aed';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(124, 58, 237, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#1e293b';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.5)';
            }}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center" style={{background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" style={{color: '#7c3aed'}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <h2 className="text-lg md:text-xl font-bold text-white mb-1">My Tickets</h2>
                <p style={{color: '#94a3b8', fontSize: '0.85rem'}} className="md:text-base">View your ticket history and results</p>
              </div>
              <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" style={{color: '#64748b'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

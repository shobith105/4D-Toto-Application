import React from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-12 text-white">Welcome to Your Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card for Uploading Ticket */}
          <div
            onClick={() => navigate('/home')}
            className="bg-white/5 rounded-lg p-8 cursor-pointer group hover:bg-white/10 transition-all border border-white/20 hover:border-white/40"
          >
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <h2 className="text-2xl font-bold mb-2 text-white">Upload a New Ticket</h2>
              <p className="text-white/70">Submit a new ticket to be processed and analyzed.</p>
            </div>
          </div>

          {/* Card for Viewing Past Tickets */}
          <div
            onClick={() => navigate('/details')}
            className="bg-white/5 rounded-lg p-8 cursor-pointer group hover:bg-white/10 transition-all border border-white/20 hover:border-white/40"
          >
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-2xl font-bold mb-2 text-white">View Past Tickets</h2>
              <p className="text-white/70">Browse your history of submitted tickets and their results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

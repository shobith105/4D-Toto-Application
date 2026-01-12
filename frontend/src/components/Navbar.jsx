import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

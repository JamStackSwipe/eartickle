import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full flex items-center justify-between p-4 bg-black text-white shadow-md">
      <Link to="/" className="flex items-center space-x-2">
        <img src="/logo.png" alt="EarTickle Logo" className="h-10 w-auto" />
        <span className="text-xl font-bold tracking-wide">EarTickle</span>
      </Link>

      <nav className="space-x-4">
        <Link to="/swipe" className="hover:underline">Swipe</Link>
        <Link to="/upload" className="hover:underline">Upload</Link>
        <Link to="/myjams" className="hover:underline">My Jams</Link>
        <Link to="/rewards" className="hover:underline">Rewards</Link>
      </nav>
    </header>
  );
};

export default Header;


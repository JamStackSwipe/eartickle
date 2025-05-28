// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">
        🎵 EarTickle
      </Link>
      <nav className="space-x-4 text-sm">
        <Link to="/swipe" className="hover:underline">🔥 Swipe</Link>
        <Link to="/upload" className="hover:underline">📥 Upload</Link>
        <Link to="/rewards" className="hover:underline">🎁 Rewards</Link>
        <Link to="/stacker" className="hover:underline">🎧 Stacker</Link>
        {user ? (
          <Link to="/profile" className="hover:underline">👤 Profile</Link>
        ) : (
          <Link to="/auth" className="hover:underline">🔐 Login</Link>
        )}
      </nav>
    </header>
  );
};

export default Header;

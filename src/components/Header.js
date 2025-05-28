// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow p-4">
      <div className="flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          🎵 EarTickle
        </Link>
        <button
          className="sm:hidden text-gray-600 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
        <nav className="hidden sm:flex space-x-4 text-sm">
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
      </div>
      {menuOpen && (
        <nav className="sm:hidden mt-4 space-y-2 text-sm">
          <Link to="/swipe" className="block hover:underline">🔥 Swipe</Link>
          <Link to="/upload" className="block hover:underline">📥 Upload</Link>
          <Link to="/rewards" className="block hover:underline">🎁 Rewards</Link>
          <Link to="/stacker" className="block hover:underline">🎧 Stacker</Link>
          {user ? (
            <Link to="/profile" className="block hover:underline">👤 Profile</Link>
          ) : (
            <Link to="/auth" className="block hover:underline">🔐 Login</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;

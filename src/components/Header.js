import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleLogoClick = () => {
    navigate(user ? '/swipe' : '/auth');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  // Hover behavior for profile dropdown
  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 300); // 300ms delay before hiding
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current); // clean up on unmount
  }, []);

  return (
    <header className="w-full px-4 py-3 bg-black text-white flex justify-between items-center shadow relative z-10">
      <div className="flex items-center space-x-4">
        {/* Optional: move autoplay toggle here */}
        {/* <button className="text-xs text-gray-300 border px-2 py-1 rounded">🔁 Auto</button> */}

        <div
          onClick={handleLogoClick}
          className="text-xl font-bold text-white hover:text-gray-300 cursor-pointer"
        >
          🎵 EarTickle
        </div>
      </div>

      {user && (
        <nav className="flex items-center space-x-4 text-sm relative">
          <Link to="/swipe" className="hover:underline text-white">
            Swipe
          </Link>
          <Link to="/myjams" className="hover:underline text-white">
            My Jams
          </Link>
          <Link to="/upload" className="hover:underline text-white">
            Upload
          </Link>
          <Link to="/stacker" className="hover:underline text-white">
            🎶 Stacker
          </Link>
          <Link to={`/artist/${user.id}`} className="hover:underline text-white">
            My Artist Page
          </Link>

          {/* Avatar + Dropdown Menu */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full border border-white cursor-pointer"
            />

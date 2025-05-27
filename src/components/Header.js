import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleLogoClick = () => {
    navigate(user ? '/swipe' : '/auth');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setMenuOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setMenuOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <header className="w-full px-4 py-3 bg-black text-white flex justify-between items-center shadow relative z-10">
      <div className="flex flex-col cursor-pointer" onClick={handleLogoClick}>
        <div className="text-xl font-bold text-white hover:text-gray-300">
          🎵 EarTickle
        </div>
        <div className="text-xs text-gray-400 -mt-1 ml-1">
          Swipe. Stack. Play.
        </div>
      </div>

      {user && (
        <nav className="flex items-center space-x-4 text-sm relative">
          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center space-x-4">
            <Link to="/swipe" className="hover:underline text-white">Swipe</Link>
            <Link to="/myjams" className="hover:underline text-white">My Jams</Link>
            <Link to="/upload" className="hover:underline text-white">Upload</Link>
            <Link to="/stacker" className="hover:underline text-white">🎶 Stacker</Link>
            <Link to={`/artist/${user.id}`} className="hover:underline text-white">My Artist Page</Link>
          </div>

          {/* Mobile Hamburger */}
          <div className="sm:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="focus:outline-none">
              ☰
            </button>
          </div>

          {/* Avatar + Dropdown Menu (Desktop only) */}
          <div
            className="relative hidden sm:block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-full border border-white cursor-pointer"
            />

                {menuOpen && (
  <div
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
    className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg text-sm overflow-hidden z-[9999]"
  >
        
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">👤 My Profile</Link>
                <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">⚙️ Settings</Link>
                <Link to="/privacy" className="block px-4 py-2 hover:bg-gray-100">🔒 Privacy</Link>
                <Link to="/terms" className="block px-4 py-2 hover:bg-gray-100">📄 Terms</Link>
                <Link to="/about" className="block px-4 py-2 hover:bg-gray-100">📖 About EarTickle</Link>
                <a href="https://github.com/JamStackSwipe/eartickle" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">🔗 GitHub</a>
                <a href="https://github.com/JamStackSwipe/eartickle/wiki" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-gray-100">📘 Wiki</a>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">🚪 Logout</button>
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full right-0 w-full bg-black text-white sm:hidden z-50 mt-2 shadow-lg rounded">
          <div className="flex flex-col px-4 py-2 space-y-2 text-sm">
            <Link to="/swipe" onClick={() => setMobileMenuOpen(false)}>Swipe</Link>
            <Link to="/myjams" onClick={() => setMobileMenuOpen(false)}>My Jams</Link>
            <Link to="/upload" onClick={() => setMobileMenuOpen(false)}>Upload</Link>
            <Link to="/stacker" onClick={() => setMobileMenuOpen(false)}>🎶 Stacker</Link>
            <Link to={`/artist/${user.id}`} onClick={() => setMobileMenuOpen(false)}>My Artist Page</Link>
            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>👤 My Profile</Link>
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)}>⚙️ Settings</Link>
            <Link to="/privacy" onClick={() => setMobileMenuOpen(false)}>🔒 Privacy</Link>
            <Link to="/terms" onClick={() => setMobileMenuOpen(false)}>📄 Terms</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>📖 About EarTickle</Link>
            <a href="https://github.com/JamStackSwipe/eartickle" target="_blank" rel="noopener noreferrer">🔗 GitHub</a>
            <a href="https://github.com/JamStackSwipe/eartickle/wiki" target="_blank" rel="noopener noreferrer">📘 Wiki</a>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>🚪 Logout</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

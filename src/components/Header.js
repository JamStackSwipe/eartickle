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

            {menuOpen && (
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg text-sm overflow-hidden"
              >
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  ⚙️ Settings
                </Link>
                <Link
                  to="/privacy"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  🔒 Privacy
                </Link>
                <Link
                  to="/terms"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  📄 Terms
                </Link>
                <a
                  href="https://github.com/JamStackSwipe/eartickle"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  🔗 GitHub
                </a>
                <a
                  href="https://github.com/JamStackSwipe/eartickle/wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  📘 Wiki
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogoClick = () => {
    navigate(user ? '/swipe' : '/auth');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="w-full px-4 py-3 bg-black text-white flex justify-between items-center shadow relative z-10">
      <div className="flex items-center space-x-4">
        {/* Optional: Autoplay toggle or other left-side control */}
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

          {/* Avatar + Hover Menu */}
          <div className="relative">
            <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="avatar"
              onClick={() => setMenuOpen(!menuOpen)}
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setTimeout(() => setMenuOpen(false), 200)}
              className="w-8 h-8 rounded-full border border-white cursor-pointer"
            />

            {menuOpen && (
              <div
                onMouseEnter={() => setMenuOpen(true)}
                onMouseLeave={() => setMenuOpen(false)}
                className="absolute right-0 mt-2 w-32 bg-white text-black rounded shadow-lg text-sm overflow-hidden"
              >
                <Link
                  to="/settings"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  ⚙️ Settings
                </Link>
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

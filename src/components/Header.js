import { Link, useNavigate } from 'react-router-dom';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (user) {
      navigate('/swipe');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="w-full px-4 py-3 bg-black text-white flex justify-between items-center shadow">
      {/* Logo redirects based on auth */}
      <div
        onClick={handleLogoClick}
        className="text-xl font-bold text-white hover:text-gray-300 cursor-pointer"
      >
        🎵 EarTickle
      </div>

      <nav className="flex items-center space-x-4 text-sm">
        {user && (
          <>
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
            <Link
              to={`/artist/${user.id}`}
              className="hover:underline text-indigo-400 font-semibold"
            >
              My Artist Page
            </Link>

            {/* Avatar linking to profile */}
            <Link to="/profile">
              <img
                src={user.user_metadata?.avatar_url || '/default-avatar.png'}
                alt="avatar"
                className="w-8 h-8 rounded-full border border-white"
              />
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;

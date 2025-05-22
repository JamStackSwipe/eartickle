import { Link } from 'react-router-dom';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();

  return (
    <header className="w-full px-4 py-3 bg-black text-white flex justify-between items-center shadow">
      <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
        🎵 EarTickle
      </Link>

      <nav className="flex items-center space-x-4 text-sm">
        <Link to="/swipe" className="hover:underline">
          Swipe
        </Link>
        <Link to="/myjams" className="hover:underline">
          My Jams
        </Link>
        <Link to="/upload" className="hover:underline">
          Upload
        </Link>
        <Link to="/profile" className="hover:underline">
          Profile
        </Link>
         <Link to="/stacker">🎶 Stacker</Link>

        {user && (
          <>
            <a
              href={`/artist/${user.id}`}
              className="hover:underline text-indigo-400 font-semibold"
            >
              My Artist Page
            </a>
            {/* Optional: show user avatar in header */}
            {/* <img
              src={user.user_metadata?.avatar_url || '/default-avatar.png'}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-white"
            /> */}
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const response = await supabase.auth.getUser();
      const currentUser = response?.data?.user ?? null;
      setUser(currentUser);
    };

    checkUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      // Avoid useNavigate to prevent Router crashes
      window.location.href = '/auth';
    }
  };

  return (
    <header className="bg-gray-800 text-white px-6 py-4 shadow-md">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <Link to="/" className="text-xl font-bold hover:text-blue-400">
          EarTickle
        </Link>

        <div className="flex space-x-6 text-sm font-medium">
          <Link to="/swipe" className="hover:text-blue-400">Swipe</Link>
          <Link to="/upload" className="hover:text-blue-400">Upload</Link>
          <Link to="/myjams" className="hover:text-blue-400">My Jams</Link>
          <Link to="/rewards" className="hover:text-blue-400">Rewards</Link>
          <Link to="/profile" className="hover:text-blue-400">Profile</Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="hover:text-red-400 ml-2"
            >
              Logout
            </button>
          ) : (
            <Link to="/auth" className="hover:text-green-400">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;

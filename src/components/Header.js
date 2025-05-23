import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="flex items-center justify-between p-4 bg-black text-white">
      {/* Left side: Autoplay toggle */}
      <div className="flex items-center">
        {/* Autoplay toggle component */}
        <button className="mr-4">Autoplay Toggle</button>
        {/* Artist link */}
        <Link to="/artist" className="text-white hover:text-gray-300">
          Artist
        </Link>
      </div>

      {/* Right side: Profile dropdown */}
      <div className="relative">
        {/* Profile avatar */}
        <img
          src="path_to_github_avatar"
          alt="Profile"
          className="w-8 h-8 rounded-full cursor-pointer"
        />
        {/* Dropdown menu */}
        <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded shadow-lg">
          <Link to="/settings" className="block px-4 py-2 hover:bg-gray-100">
            Settings
          </Link>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from "react";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black shadow-md">
      <div className="flex items-center space-x-4">
        <img
          src="/logo.png"
          alt="EarTickle Logo"
          className="h-10 w-auto"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">EarTickle</h1>
          <p className="text-sm text-gray-400">Swipe. Stack. Play.</p>
        </div>
      </div>

      <nav className="hidden md:flex space-x-6 text-white text-sm">
        <a href="/auth" className="hover:text-blue-400">Auth</a>
        <a href="/swipe" className="hover:text-blue-400">Swipe</a>
        <a href="/jamstack" className="hover:text-blue-400">JamStack</a>
        <a href="/upload" className="hover:text-blue-400">Upload</a>
      </nav>
    </header>
  );
};

export default Header;
// components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from './AuthProvider';

const Header = () => {
  const { user } = useUser();

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-blue-600">🎵 EarTickle</Link>
      <nav className="space-x-4 text-sm">
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
    </header>
  );
};

export default Header;


// components/Footer.js
import React from 'react';

const Footer = () => (
  <footer className="bg-gray-100 text-center text-sm text-gray-600 py-6 mt-12">
    <div className="space-x-4">
      <a href="/terms" className="hover:underline">Terms</a>
      <a href="/privacy" className="hover:underline">Privacy</a>
      <a href="https://github.com/JamStackSwipe/eartickle" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
    </div>
    <p className="mt-2">© {new Date().getFullYear()} EarTickle. All rights reserved.</p>
  </footer>
);

export default Footer;


// App.js (minimal layout structure)
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SwipeScreen from './screens/SwipeScreen';
import UploadScreen from './screens/UploadScreen';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';
import AuthScreen from './screens/AuthScreen';
import JamStackScreen from './screens/JamStackScreen';

function App() {
  return (
    <Router>
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<SwipeScreen />} />
          <Route path="/swipe" element={<SwipeScreen />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/rewards" element={<RewardsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/stacker" element={<JamStackScreen />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;

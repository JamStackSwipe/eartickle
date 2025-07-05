import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import SwipeScreen from './screens/SwipeScreen';
import UploadScreen from './screens/UploadScreen';
import JamStackScreen from './screens/JamStackScreen';
import LoginScreen from './screens/LoginScreen';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ArtistProfileScreen from './screens/ArtistProfileScreen';
import HomePage from './screens/HomePage';
import ChartsScreen from './screens/ChartsScreen';
import Privacy from './screens/Privacy';
import FlavorsScreen from './screens/FlavorsScreen';
import Terms from './screens/Terms';
import About from './screens/AboutScreen';
import SongPage from './screens/SongPage';

function App() {
  return (
    <div className="app flex flex-col min-h-screen">
      <Header />
      <main className="main-content flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<LoginScreen />} />
          <Route path="/swipe" element={<SwipeScreen />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/stacker" element={<JamStackScreen />} />
          <Route path="/rewards" element={<RewardsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/charts" element={<ChartsScreen />} />
          <Route path="/artist-:id" element={<ArtistProfileScreen />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/genres" element={<FlavorsScreen />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
          <Route path="/song/:songId" element={<SongPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

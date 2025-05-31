// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import SwipeScreen from './screens/SwipeScreen';
import UploadScreen from './screens/UploadScreen';
import MyJamsScreen from './screens/MyJamsScreen';
import JamStackScreen from './screens/JamStackScreen';
import LoginScreen from './screens/LoginScreen';
import RewardsScreen from './screens/RewardsScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import ArtistProfileScreen from './screens/ArtistProfileScreen';
import HomePage from './screens/HomePage'; // ✅ NEW
import ChartsScreen from './screens/ChartsScreen';


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* ✅ Set homepage */}
        <Route path="/auth" element={<LoginScreen />} />
        <Route path="/swipe" element={<SwipeScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
        <Route path="/myjams" element={<MyJamsScreen />} />
        <Route path="/stacker" element={<JamStackScreen />} />
        <Route path="/rewards" element={<RewardsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/charts" element={<ChartsScreen />} />
        <Route path="/artist/:id" element={<ArtistProfileScreen />} />
      </Routes>
    </>
  );
}

export default App;

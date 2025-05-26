// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './components/AuthProvider';

import Header from './components/Header';
import LoginScreen from './screens/LoginScreen';     // ✅ use this for /auth
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';
import SwipeScreen from './screens/SwipeScreen';
import JamStackScreen from './screens/JamStackScreen';
import RewardsScreen from './screens/RewardsScreen';
import MyJamsScreen from './screens/MyJamsScreen';
import ArtistProfileScreen from './screens/ArtistProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import Dashboard from './screens/Dashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route path="/auth" element={<LoginScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/swipe" element={<SwipeScreen />} />
          <Route path="/jamstack" element={<JamStackScreen />} />
          <Route path="/rewards" element={<RewardsScreen />} />
          <Route path="/myjams" element={<MyJamsScreen />} />
          <Route path="/artist/:id" element={<ArtistProfileScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

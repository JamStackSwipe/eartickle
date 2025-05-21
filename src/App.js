import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './components/AuthProvider';

import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';
import SwipeScreen from './screens/SwipeScreen';
import JamStackScreen from './screens/JamStackScreen';
import AuthScreen from './screens/AuthScreen';
import RewardsScreen from './screens/RewardsScreen';
import MyJamsScreen from './screens/MyJamsScreen';
import SettingsScreen from './screens/SettingsScreen';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<SwipeScreen />} /> {/* 👈 or any public-facing intro */}
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/auth" element={<AuthScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/upload" element={<UploadScreen />} />
          <Route path="/swipe" element={<SwipeScreen />} />
          <Route path="/jamstack" element={<JamStackScreen />} />
          <Route path="/rewards" element={<RewardsScreen />} />
          <Route path="/myjams" element={<MyJamsScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;


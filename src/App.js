import React from 'react';
import { Routes, Route } from 'react-router-dom'; // ✅ No "as Router"
import Header from './components/Header';
import { AuthProvider } from './components/AuthProvider';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';
import SwipeScreen from './screens/SwipeScreen';
import JamStackScreen from './screens/JamStackScreen';
import RewardsScreen from './screens/RewardsScreen';
import MyJamsScreen from './screens/MyJamsScreen';
import SettingsScreen from './screens/SettingsScreen';
import JamStackPlayer from './screens/JamStackPlayer';
import ArtistProfileScreen from './screens/ArtistProfileScreen';
import Privacy from './screens/Privacy';
import Terms from './screens/Terms';




function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/auth" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/artist/:id" element={<ArtistProfileScreen />} />
        <Route path="/stacker" element={<JamStackPlayer />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
        <Route path="/swipe" element={<SwipeScreen />} />
        <Route path="/jamstack" element={<JamStackScreen />} />
        <Route path="/rewards" element={<RewardsScreen />} />
        <Route path="/myjams" element={<MyJamsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

      </Routes>
    </AuthProvider>
  );
}

export default App;

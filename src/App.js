import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';

// Screens
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';
import SwipeScreen from './screens/SwipeScreen';
import JamStackScreen from './screens/JamStackScreen';
import AuthScreen from './screens/AuthScreen';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LoginScreen />} />         {/* 👈 default route is login */}
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
        <Route path="/swipe" element={<SwipeScreen />} />
        <Route path="/jamstack" element={<JamStackScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
      </Routes>
    </Router>
  );
}

export default App;

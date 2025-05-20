// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';

const Home = () => (
  <div>
    <h2>Welcome to EarTickle™</h2>
    <p>Choose a screen:</p>
    <ul>
      <li><Link to="/login">Login</Link></li>
      <li><Link to="/profile">Profile</Link></li>
      <li><Link to="/upload">Upload Song</Link></li>
    </ul>
  </div>
);

const ProfileScreen = () => <div><h2>Profile (Coming Soon)</h2></div>;
const UploadScreen = () => <div><h2>Upload (Coming Soon)</h2></div>;

function App() {
  return (
    <Router>
      <div style={{ padding: '1rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/upload" element={<UploadScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

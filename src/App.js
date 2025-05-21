import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';

const Home = () => (
  <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
    <h1>Welcome to EarTickle™</h1>
    <p>Choose a screen:</p>
    <ul>
      <li><Link to="/login">Login</Link></li>
      <li><Link to="/profile">Profile</Link></li>
      <li><Link to="/upload">Upload Song</Link></li>
    </ul>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
      </Routes>
    </Router>
  );
}

export default App;

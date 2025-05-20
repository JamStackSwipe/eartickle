import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthScreen from "./screens/AuthScreen";
import Dashboard from "./screens/Dashboard";
import JamStackView from "./screens/JamStackView";
import SwipeScreen from "./screens/SwipeScreen";
import UploadScreen from "./screens/UploadScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SwipeScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jamstack" element={<JamStackView />} />
        <Route path="/upload" element={<UploadScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
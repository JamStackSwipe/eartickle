import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";

import AuthScreen from "./screens/AuthScreen";
import SwipeScreen from "./screens/SwipeScreen";
import JamStackView from "./screens/JamStackView";
import UploadScreen from "./screens/UploadScreen";

function App() {
  return (
    <Router>
      <div className="bg-black min-h-screen text-white">
        <Header />
        <main className="p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/swipe" />} />
            <Route path="/auth" element={<AuthScreen />} />
            <Route path="/swipe" element={<SwipeScreen />} />
            <Route path="/jamstack" element={<JamStackView />} />
            <Route path="/upload" element={<UploadScreen />} />
            <Route path="*" element={<p className="text-red-500">404 - Not Found</p>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

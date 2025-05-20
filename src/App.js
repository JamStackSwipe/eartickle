import React from "react";
import Header from "./components/Header";
import AuthScreen from "./screens/AuthScreen";
import SwipeScreen from "./screens/SwipeScreen";
import JamStackView from "./screens/JamStackView";
import UploadScreen from "./screens/UploadScreen";

function App() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Header />
      <main className="p-6 space-y-12">
        <AuthScreen />
        <SwipeScreen />
        <JamStackView />
        <UploadScreen />
      </main>
    </div>
  );
}

export default App;
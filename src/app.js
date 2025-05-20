import React from "react";
import AuthScreen from "./screens/AuthScreen";
import SwipeScreen from "./screens/SwipeScreen";
import JamStackView from "./screens/JamStackView";
import UploadScreen from "./screens/UploadScreen";

function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ color: "#fff" }}>EarTickle</h1>
      <AuthScreen />
      <hr />
      <SwipeScreen />
      <hr />
      <JamStackView />
      <hr />
      <UploadScreen />
    </div>
  );
}

export default App;

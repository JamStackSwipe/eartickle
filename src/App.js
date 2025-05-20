import React from "react";
import AuthScreen from "./screens/AuthScreen";
import SwipeScreen from "./screens/SwipeScreen";
import JamStackView from "./screens/JamStackView";
import UploadScreen from "./screens/UploadScreen";

function App() {
  return (
    <div style={{ backgroundColor: "#000", color: "#fff", padding: 20 }}>
      <h1 style={{ textAlign: "center", fontSize: "2rem", marginBottom: 20 }}>
        🎧 EarTickle App
      </h1>

      {/* Uncomment and test one at a time to verify */}
      <AuthScreen />
      <hr style={{ margin: "2rem 0", borderColor: "#444" }} />
      <SwipeScreen />
      <hr style={{ margin: "2rem 0", borderColor: "#444" }} />
      <JamStackView />
      <hr style={{ margin: "2rem 0", borderColor: "#444" }} />
      <UploadScreen />
    </div>
  );
}

export default App;



import React from "react";

function App() {
  try {
    const test = true;
    if (!test) throw new Error("This will never happen");

    return (
      <div style={{
        background: "black",
        color: "lime",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2rem"
      }}>
        ✅ App loaded successfully
      </div>
    );
  } catch (error) {
    return (
      <div style={{
        background: "black",
        color: "red",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem"
      }}>
        ❌ Error: {error.message}
      </div>
    );
  }
}

export default App;


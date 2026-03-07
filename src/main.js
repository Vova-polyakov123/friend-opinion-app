import React from "react";
import ReactDOM from "react-dom/client";

function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial" }}>
      <h1>Friend Opinion</h1>
      <p>Send me anonymous messages 👀</p>

      <input placeholder="Write message..." style={{ padding: "10px", width: "220px" }} />
      <br /><br />

      <button style={{ padding: "10px 20px" }}>Send</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App />
);
import React from "react";
import ReactDOM from "react-dom/client";

function App() {
    return (
        <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Arial" }}>
            <h1>Friend Opinion</h1>
            <p>Send me anonymous message</p>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
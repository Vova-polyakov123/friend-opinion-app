import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import bridge from "@vkontakte/vk-bridge";

bridge.send("VKWebAppInit");

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);

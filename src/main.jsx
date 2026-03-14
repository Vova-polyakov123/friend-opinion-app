import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import bridge from "@vkontakte/vk-bridge";

async function start() {

    try {
        await bridge.send("VKWebAppInit");
    } catch (e) {
        console.log("VK init error", e);
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );

}

start();

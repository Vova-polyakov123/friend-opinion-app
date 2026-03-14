import bridge from "@vkontakte/vk-bridge";

if (window.location.search.includes("vk_platform")) {
    bridge.send("VKWebAppInit");
}
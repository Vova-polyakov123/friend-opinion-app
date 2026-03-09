import { useState } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function Results() {

    const shareResult = () => {
        bridge.send("VKWebAppShare", {
            link: window.location.href
        });
    };

    const inviteFriends = () => {
        bridge.send("VKWebAppShowInviteBox");
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Ссылка скопирована");
    };

    return (
        <div>

            <h2>Результат</h2>

            <button onClick={shareResult}>
                Поделиться результатом
            </button>

            <button onClick={inviteFriends}>
                Пригласить друзей
            </button>

            <button onClick={copyLink}>
                Скопировать ссылку
            </button>

        </div>
    );
}
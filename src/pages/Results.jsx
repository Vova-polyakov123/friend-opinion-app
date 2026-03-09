import { useState } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function Results() {

    const shareResult = () => {
        bridge.send("VKWebAppShowWallPostBox", {
            message: "🔥 Пройди опрос и узнай что о тебе думают друзья!",
            attachments: window.location.href
        });
    };

    const inviteFriends = () => {
        bridge.send("VKWebAppShowInviteBox");
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Ссылка скопирована");
    };

    // выбор друга и отправка сообщения
    const sendToFriend = async () => {

        try {

            const friend = await bridge.send("VKWebAppShowFriendPicker");

            const user_id = friend.id;

            await fetch("/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    user_id: user_id
                })
            });

            alert("Сообщение отправлено другу");

        } catch (error) {

            console.log(error);

            alert("Не удалось отправить");

        }

    };

    return (
        <div>

            <h2>Опрос завершён</h2>

            <button onClick={shareResult}>
                📢 Поделиться
            </button>

            <button onClick={inviteFriends}>
                👥 Пригласить друзей
            </button>

            <button onClick={sendToFriend}>
                ✉ Отправить другу
            </button>

            <button onClick={copyLink}>
                🔗 Скопировать ссылку
            </button>

        </div>
    );
}
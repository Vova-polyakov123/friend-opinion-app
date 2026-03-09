import { useState } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function Home() {

    const [username, setUsername] = useState("");
    const [review, setReview] = useState("");

    const [reviews, setReviews] = useState([
        { name: "Алексей", text: "Приложение супер! Очень интересно читать ответы друзей." },
        { name: "Марина", text: "Классная идея. Некоторые ответы реально удивили 😂" },
        { name: "Игорь", text: "Лучшее приложение во VK которое видел." },
        { name: "Катя", text: "Очень прикольно и затягивает!" }
    ]);

    // создать ссылку
    const createLink = () => {

        if (!username) {
            alert("Введите ник");
            return;
        }

        const link = `${window.location.origin}/${username}`;

        navigator.clipboard.writeText(link);

        alert("Ссылка скопирована: " + link);

    };

    // поделиться
    const shareLink = () => {

        const link = `${window.location.origin}/${username}`;

        bridge.send("VKWebAppShare", {
            link: link
        });

    };

    // пригласить друзей
    const inviteFriends = () => {
        bridge.send("VKWebAppShowInviteBox");
    };

    // добавить отзыв
    const sendReview = () => {

        if (!review) {
            alert("Напишите отзыв");
            return;
        }

        setReviews([
            ...reviews,
            {
                name: "Пользователь",
                text: review
            }
        ]);

        setReview("");

    };

    return (

        <div className="container">

            <h1>Тайное мнение друзей</h1>
            <p>Узнай что о тебе думают друзья</p>

            <input
                placeholder="Ваш ник"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <button onClick={createLink}>
                Получить ссылку
            </button>

            <button onClick={shareLink}>
                Поделиться ссылкой
            </button>

            <button onClick={inviteFriends}>
                Пригласить друзей
            </button>

            <h2>Отзывы</h2>

            {reviews.map((r, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                    <b>{r.name}</b>
                    <p>{r.text}</p>
                </div>
            ))}

            <h3>Написать отзыв</h3>

            <textarea
                placeholder="Ваш отзыв"
                value={review}
                onChange={(e) => setReview(e.target.value)}
            />

            <button onClick={sendReview}>
                Отправить отзыв
            </button>

        </div>

    );

}
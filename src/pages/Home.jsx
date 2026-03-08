import { useState } from "react";

export default function Home() {
    const [username, setUsername] = useState("");

    const createLink = () => {
        const link = `${window.location.origin}/${username}`;
        navigator.clipboard.writeText(link);
        alert("Ссылка скопирована: " + link);
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

            <button onClick={createLink}>Получить ссылку</button>
        </div>
    );
}
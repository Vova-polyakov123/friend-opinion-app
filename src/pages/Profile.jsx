import { useState } from "react";

export default function Profile() {

    const [message, setMessage] = useState("");

    const sendMessage = async () => {

        if (!message) {
            alert("Введите сообщение");
            return;
        }

        await fetch("/api/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: message
            })
        });

        alert("Сообщение отправлено анонимно");
        setMessage("");
    };

    return (

        <div>

            <h2>Анонимное сообщение</h2>

            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Напишите сообщение"
            />

            <button onClick={sendMessage}>
                Отправить
            </button>

        </div>

    );

}
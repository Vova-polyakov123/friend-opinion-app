import { useState } from "react";

const questions = [
    "Кто в тебя тайно влюблен?",
    "Кто лучший друг?",
    "Кто чаще думает о тебе?",
    "Кто бы пошел с тобой на свидание?",
    "Кто самый романтичный?"
];

export default function Quiz() {
    const [index, setIndex] = useState(0);

    const next = () => {
        setIndex(index + 1);
    };

    return (
        <div>
            <h2>{questions[index]}</h2>

            <button onClick={next}>Ответить</button>
        </div>
    );
}
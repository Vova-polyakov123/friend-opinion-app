import { useNavigate } from "react-router-dom";

export default function Profile({ username }) {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Ответь про {username}</h2>

            <button onClick={() => navigate("/quiz")}>
                Пройти опрос
            </button>
        </div>
    );
}
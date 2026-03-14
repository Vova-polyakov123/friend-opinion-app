import { useState } from "react"
import bridge from "@vkontakte/vk-bridge"
import axios from "axios"
import { questions } from "../data/questions"

function Quiz({ user, openResults }) {

    const [friend, setFriend] = useState(null)

    const selectFriend = async () => {

        const data = await bridge.send(
            "VKWebAppShowFriendsBox"
        )

        if (data.users) {
            setFriend(data.users[0])
        }

    }

    const sendAnswer = async (question) => {

        await axios.post("/api/send", {

            from: user.id,
            to: friend.id,
            question: question

        })

        openResults()

    }

    return (

        <div>

            <h2>Выбери друга</h2>

            <button onClick={selectFriend}>
                Выбрать друга
            </button>

            {friend && (

                <div>

                    <h3>
                        {friend.first_name}
                    </h3>

                    {questions.map(q => (
                        <button
                            key={q.id}
                            onClick={() => sendAnswer(q.text)}
                        >
                            {q.text}
                        </button>
                    ))}

                </div>

            )}

        </div>

    )

}

export default Quiz
import { useEffect, useState } from "react"
import axios from "axios"
import bridge from "@vkontakte/vk-bridge"

function Results({ user }) {

    const [answers, setAnswers] = useState([])

    useEffect(() => {

        axios.get("/api/get?user=" + user.id)
            .then(res => {
                setAnswers(res.data.answers)
            })

    }, [])

    const pay = async () => {

        await bridge.send("VKWebAppOpenPayForm", {

            app_id: 1234567,
            action: "pay-to-service",

            params: {
                amount: 5
            }

        })

    }

    return (

        <div>

            <h2>Ответы</h2>

            {answers.map((a, i) => (
                <div key={i}>
                    {a.question}
                </div>
            ))}

            <button onClick={pay}>
                Открыть секретные ответы (5 голосов)
            </button>

        </div>

    )

}

export default Results
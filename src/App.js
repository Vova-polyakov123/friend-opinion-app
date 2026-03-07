import { useState } from "react"
import { questions } from "./questions"

export default function App() {

  const [selectedFriend, setSelectedFriend] = useState(null)
  const [answers, setAnswers] = useState({})
  const [results, setResults] = useState([])

  const friends = [
    { id: 1, name: "Алексей Иванов", photo: "https://i.pravatar.cc/100?img=1" },
    { id: 2, name: "Мария Смирнова", photo: "https://i.pravatar.cc/100?img=2" },
    { id: 3, name: "Дмитрий Петров", photo: "https://i.pravatar.cc/100?img=3" }
  ]

  function answer(q, opt) {
    setAnswers({ ...answers, [q]: opt })
  }

  function sendSurvey() {

    const newResult = {
      friend: selectedFriend,
      answers: answers
    }

    const all = [...results, newResult]

    setResults(all)

    alert("Ответ отправлен анонимно")

    setSelectedFriend(null)
    setAnswers({})
  }

  return (

    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#ff7eb3,#65d6ff)",
      padding: 20,
      fontFamily: "sans-serif"
    }}>

      <h1 style={{ color: "white" }}>
        Тайное мнение друзей
      </h1>

      {!selectedFriend && (

        <div>

          <h2 style={{ color: "white" }}>Выберите друга</h2>

          {friends.map(f => (

            <div key={f.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                padding: 10,
                borderRadius: 10,
                marginBottom: 10,
                cursor: "pointer"
              }}
              onClick={() => setSelectedFriend(f)}
            >

              <img src={f.photo}
                width="40"
                style={{ borderRadius: "50%", marginRight: 10 }}
              />

              {f.name}

            </div>

          ))}

        </div>

      )}

      {selectedFriend && (

        <div>

          <h2 style={{ color: "white" }}>
            Опрос про {selectedFriend.name}
          </h2>

          {questions.map(q => (

            <div key={q.id}
              style={{
                background: "white",
                padding: 15,
                borderRadius: 10,
                marginBottom: 15
              }}
            >

              <p>{q.text}</p>

              {q.options.map(o => (

                <button
                  key={o}
                  onClick={() => answer(q.id, o)}
                  style={{ display: "block", marginBottom: 5 }}
                >
                  {o}
                </button>

              ))}

            </div>

          ))}

          <button onClick={sendSurvey}>
            Отправить анонимно
          </button>

        </div>

      )}

    </div>

  )

}
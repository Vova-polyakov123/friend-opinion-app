import React, { useState, useEffect } from "react"
import bridge from "@vkontakte/vk-bridge"

export default function App() {

  const [screen, setScreen] = useState("menu")
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState([])

  const questions = [
    {
      q: "Этот человек тайно в кого-то влюблён?",
      a: ["Да", "Нет", "Возможно", "100%"]
    },
    {
      q: "Насколько он весёлый?",
      a: ["Очень", "Средне", "Редко", "Вообще нет"]
    },
    {
      q: "Можно ли ему доверять?",
      a: ["Да", "Не всегда", "Сомневаюсь", "Нет"]
    }
  ]

  useEffect(() => {

    async function init() {

      try {

        await bridge.send("VKWebAppInit")

        await bridge.send("VKWebAppGetAuthToken", {
          app_id: 54474085,
          scope: "friends"
        })

        const res = await bridge.send("VKWebAppCallAPIMethod", {
          method: "friends.get",
          params: {
            order: "name",
            fields: "photo_100",
            v: "5.131"
          }
        })

        setFriends(res.response.items)

      } catch (e) {

        console.log("Ошибка VK:", e)

        setFriends([
          { id: 1, first_name: "Алексей" },
          { id: 2, first_name: "Игорь" },
          { id: 3, first_name: "Анна" }
        ])

      }

    }

    init()

  }, [])

  function startQuiz(friend) {

    setSelectedFriend(friend)
    setQIndex(0)
    setAnswers([])
    setScreen("quiz")

  }

  function answerClick(a) {

    const newAnswers = [...answers, {
      question: questions[qIndex].q,
      answer: a
    }]

    setAnswers(newAnswers)

    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1)
    } else {
      setScreen("result")
    }

  }

  function sendResult() {

    bridge.send("VKWebAppShowWallPostBox", {
      message: "😏 Про тебя прошли опрос! Открой приложение и узнай ответы!"
    })

  }

  async function invite() {

    try {
      await bridge.send("VKWebAppShowInviteBox")
    } catch (e) {
      console.log("Ошибка приглашения:", e)
    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <h1 style={styles.title}>
          🔥 Опрос про друзей
        </h1>

        <button
          style={styles.button}
          onClick={() => setScreen("friends")}
        >
          Выбрать друга
        </button>

        <button
          style={styles.button}
          onClick={invite}
        >
          📩 Пригласить друзей
        </button>

        <button
          style={styles.button}
          onClick={() => setScreen("reviews")}
        >
          ⭐ Отзывы
        </button>

      </div>

    )

  }

  if (screen === "friends") {

    return (

      <div style={styles.bg}>

        <h2>Выбери друга</h2>

        {friends.map(f => (

          <button
            key={f.id}
            style={styles.friend}
            onClick={() => startQuiz(f)}
          >
            {f.first_name}
          </button>

        ))}

        <button
          style={styles.menu}
          onClick={() => setScreen("menu")}
        >
          Назад
        </button>

      </div>

    )

  }

  if (screen === "quiz") {

    const q = questions[qIndex]

    return (

      <div style={styles.bg}>

        <h2>
          Опрос про {selectedFriend.first_name}
        </h2>

        <p style={styles.question}>
          {q.q}
        </p>

        {q.a.map((a, i) => (

          <button
            key={i}
            style={styles.answer}
            onClick={() => answerClick(a)}
          >
            {a}
          </button>

        ))}

      </div>

    )

  }

  if (screen === "result") {

    return (

      <div style={styles.bg}>

        <h2>
          Опрос про {selectedFriend.first_name} завершён
        </h2>

        <button
          style={styles.button}
          onClick={sendResult}
        >
          Отправить уведомление
        </button>

        <button
          style={styles.button}
          onClick={() => setScreen("menu")}
        >
          В меню
        </button>

      </div>

    )

  }

  if (screen === "reviews") {

    return (

      <div style={styles.bg}>

        <h2>Отзывы</h2>

        <div style={styles.review}>
          ⭐⭐⭐⭐⭐ Очень смешное приложение
        </div>

        <div style={styles.review}>
          ⭐⭐⭐⭐ Узнал много нового о друзьях
        </div>

        <div style={styles.review}>
          ⭐⭐⭐⭐⭐ Играем всей компанией
        </div>

        <button
          style={styles.menu}
          onClick={() => setScreen("menu")}
        >
          Назад
        </button>

      </div>

    )

  }

}

const styles = {

  bg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#6a11cb,#2575fc,#ff416c)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontFamily: "Arial",
    padding: "20px"
  },

  title: {
    fontSize: "34px",
    marginBottom: "30px"
  },

  button: {
    padding: "14px 35px",
    margin: "8px",
    fontSize: "18px",
    borderRadius: "12px",
    border: "none",
    background: "#22c55e",
    color: "white",
    cursor: "pointer"
  },

  friend: {
    padding: "12px 25px",
    margin: "6px",
    borderRadius: "10px",
    border: "none",
    background: "white",
    color: "black",
    cursor: "pointer",
    width: "220px"
  },

  answer: {
    padding: "12px",
    margin: "6px",
    borderRadius: "10px",
    border: "none",
    background: "white",
    color: "black",
    cursor: "pointer",
    width: "250px"
  },

  question: {
    fontSize: "22px",
    marginBottom: "20px"
  },

  menu: {
    marginTop: "20px",
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#333",
    color: "white"
  },

  review: {
    background: "white",
    color: "black",
    padding: "10px",
    borderRadius: "10px",
    margin: "5px",
    width: "260px"
  }

}
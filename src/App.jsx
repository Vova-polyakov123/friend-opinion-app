import React, { useState, useEffect } from "react"
import bridge from "@vkontakte/vk-bridge"

export default function App() {

  const [screen, setScreen] = useState("menu")
  const [userId, setUserId] = useState(null)
  const [friends, setFriends] = useState([])
  const [selectedFriend, setSelectedFriend] = useState(null)

  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState([])

  const [inbox, setInbox] = useState([])
  const [messageCount] = useState(5)

  const questions = [

    { q: "Этот человек тайно в кого-то влюблён?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Этот человек хороший друг?", a: ["Лучший", "Нормальный", "Средний", "Плохой"] },
    { q: "Можно ли ему доверять?", a: ["Да", "Иногда", "Сомневаюсь", "Нет"] },
    { q: "Он часто думает о любви?", a: ["Да", "Иногда", "Редко", "Нет"] },
    { q: "Этот человек популярный?", a: ["Очень", "Средне", "Не особо", "Нет"] },
    { q: "Этот человек часто флиртует?", a: ["Да", "Иногда", "Редко", "Нет"] },
    { q: "Этот человек скрывает секрет?", a: ["Да", "Возможно", "Не думаю", "Нет"] },

  ]

  const fakeMessages = [

    "💘 Кто-то тайно влюблён в тебя",
    "🔥 Ты очень нравишься одному другу",
    "😏 Кто-то считает тебя очень привлекательным",
    "🤫 Один друг не доверяет тебе",
    "👀 Кто-то часто думает о тебе"

  ]

  useEffect(() => {

    async function init() {

      await bridge.send("VKWebAppInit")

      const user = await bridge.send("VKWebAppGetUserInfo")
      setUserId(user.id)

    }

    init()

  }, [])

  async function loadFriends() {

    try {

      const token = await bridge.send("VKWebAppGetAuthToken", {
        app_id: 54474085,
        scope: "friends"
      })

      const res = await bridge.send("VKWebAppCallAPIMethod", {
        method: "friends.get",
        params: {
          order: "name",
          fields: "photo_100",
          access_token: token.access_token,
          v: "5.131"
        }
      })

      if (res.response) {
        setFriends(res.response.items)
      }

    } catch {

      bridge.send("VKWebAppShowSnackbar", {
        text: "⚠️ Без доступа к друзьям опрос ограничен"
      })

      setFriends([
        { id: 1, first_name: "Алексей", photo_100: "https://i.pravatar.cc/100?img=1" },
        { id: 2, first_name: "Игорь", photo_100: "https://i.pravatar.cc/100?img=2" },
        { id: 3, first_name: "Анна", photo_100: "https://i.pravatar.cc/100?img=3" }
      ])

    }

  }

  function startQuiz(friend) {

    setSelectedFriend(friend)
    setQIndex(0)
    setAnswers([])

    setScreen("quiz")

  }

  function answerClick(a) {

    const newAnswers = [...answers, { q: questions[qIndex].q, a }]

    setAnswers(newAnswers)

    if (qIndex + 1 < questions.length) {

      setQIndex(qIndex + 1)

    } else {

      bridge.send("VKWebAppShowSnackbar", { text: "🔥 Ответ отправлен анонимно" })

      setScreen("result")

    }

  }

  function loadInbox() {

    const fake = fakeMessages.map(t => ({ text: t }))

    setInbox(fake)

    bridge.send("VKWebAppShowSnackbar", { text: "📩 Тебе пришёл новый ответ" })

    setScreen("inbox")

  }

  function getLink() {

    return `https://vk.com/app54474085#${userId}`

  }

  async function shareResult() {

    try {

      await bridge.send("VKWebAppShowStoryBox", {
        background_type: "image",
        url: "https://i.imgur.com/8Km9tLL.png",
        attachment: {
          text: "😈 Пройди анонимный опрос про меня",
          type: "url",
          url: getLink()
        }
      })

    } catch { }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <h1 style={styles.title}>🔥 Опрос про друзей</h1>

        <div style={{ marginBottom: "20px" }}>
          📩 Тебе написали {messageCount} человек
        </div>

        <button
          style={styles.button}
          onClick={() => {
            loadFriends()
            setScreen("friends")
          }}>

          👥 Выбрать друга

        </button>

        <button style={styles.button}
          onClick={loadInbox}>

          📥 Мои ответы

        </button>

        <button style={styles.button}
          onClick={shareResult}>

          🚀 Поделиться

        </button>

      </div>

    )

  }

  if (screen === "friends") {

    return (

      <div style={styles.bg}>

        <h2>Выбери друга</h2>

        {friends.map(f => (

          <div key={f.id}

            style={styles.friend}

            onClick={() => startQuiz(f)}>

            <img src={f.photo_100} style={styles.avatar} />

            <div>{f.first_name}</div>

          </div>

        ))}

        <button style={styles.menu}

          onClick={() => setScreen("menu")}>

          Назад

        </button>

      </div>

    )

  }

  if (screen === "quiz") {

    const q = questions[qIndex]

    return (

      <div style={styles.bg}>

        <h2>{selectedFriend?.first_name}</h2>

        <h3 style={{ textAlign: "center" }}>{q.q}</h3>

        {q.a.map(a => (

          <button key={a}

            style={styles.button}

            onClick={() => answerClick(a)}>

            {a}

          </button>

        ))}

      </div>

    )

  }

  if (screen === "result") {

    return (

      <div style={styles.bg}>

        <h2>Ответ отправлен</h2>

        <p>Он увидит результат позже</p>

        <button style={styles.button}
          onClick={shareResult}>

          🚀 Поделиться опросом

        </button>

        <button style={styles.menu}
          onClick={() => setScreen("menu")}>

          В меню

        </button>

      </div>

    )

  }

  if (screen === "inbox") {

    return (

      <div style={styles.bg}>

        <h2>Ответы друзей</h2>

        {inbox.map((m, i) => (

          <div key={i} style={styles.review}>

            {m.text}

            <button style={styles.unlock}>

              🔒 Узнать кто ответил — 59₽

            </button>

          </div>

        ))}

        <button style={styles.menu}
          onClick={() => setScreen("menu")}>

          Назад

        </button>

      </div>

    )

  }

}

const styles = {

  bg: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#ff4d6d,#7b2ff7)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontFamily: "Inter,Arial",
    padding: "20px"
  },

  title: {
    fontSize: "40px",
    fontWeight: "700",
    marginBottom: "25px",
    textAlign: "center"
  },

  button: {
    padding: "16px 40px",
    margin: "10px",
    fontSize: "18px",
    borderRadius: "30px",
    border: "none",
    background: "linear-gradient(90deg,#ff8a00,#ff2d55)",
    color: "white",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "white",
    color: "#111",
    padding: "12px",
    borderRadius: "16px",
    width: "260px",
    margin: "8px",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(0,0,0,0.2)"
  },

  avatar: {
    width: "50px",
    height: "50px",
    borderRadius: "50%"
  },

  menu: {
    marginTop: "20px",
    padding: "12px 26px",
    borderRadius: "20px",
    border: "none",
    background: "#111",
    color: "white"
  },

  review: {
    background: "white",
    color: "black",
    padding: "14px",
    borderRadius: "14px",
    margin: "8px",
    width: "260px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
  },

  unlock: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    background: "#ff2d55",
    color: "white"
  }

}
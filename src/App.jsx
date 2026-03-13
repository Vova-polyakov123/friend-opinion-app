import React, { useState, useEffect } from "react"
import bridge from "@vkontakte/vk-bridge"

const APP_ID = 54474085 // <-- ВСТАВЬ РЕАЛЬНЫЙ ID ПРИЛОЖЕНИЯ

export default function App() {

  const [screen, setScreen] = useState("menu")
  const [user, setUser] = useState(null)

  const [friends, setFriends] = useState([])
  const [search, setSearch] = useState("")
  const [friendsError, setFriendsError] = useState(false)

  const [selectedFriend, setSelectedFriend] = useState(null)

  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState([])

  const [inbox, setInbox] = useState([])

  useEffect(() => {

    async function init() {

      try {

        await bridge.send("VKWebAppInit")

        const userInfo = await bridge.send("VKWebAppGetUserInfo")
        setUser(userInfo)

      } catch (e) {

        console.log(e)

      }

    }

    init()

  }, [])

  const questions = [

    { q: "Этот человек тайно в кого-то влюблён?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он нравится противоположному полу?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Можно ли ему доверять?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он хороший друг?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Этот человек популярный?", a: ["Да", "Нет", "Возможно", "100%"] }

  ]

  async function requestFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends")
      const list = res.items || []

      setFriends(list)
      setScreen("friends")

    } catch (e) {

      console.log(e)
      setFriendsError(true)

    }

  }

  const filteredFriends = friends.filter(f =>
    (f.first_name + " " + (f.last_name || ""))
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  function startQuiz(friend) {

    setSelectedFriend(friend)
    setQIndex(0)
    setAnswers([])
    setScreen("quiz")

  }

  function answerClick(a) {

    setAnswers(prev => [...prev, a])

    if (qIndex < questions.length - 1) {

      setQIndex(prev => prev + 1)

    } else {

      setInbox(prev => [...prev, "💌 Кто-то ответил про тебя"])
      setScreen("result")

    }

  }

  async function buyVoices() {

    try {

      await bridge.send("VKWebAppShowOrderBox", {
        type: "item",
        item: "answers3"
      })

    } catch (e) {

      console.log(e)

    }

  }

  async function shareStory() {

    if (!user) return

    try {

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "gradient",

        background_color: "#6a3cff",
        background_bottom_color: "#ff6aa6",

        sticker: {
          sticker_type: "renderable",
          text: "🔥 Тайное мнение друзей"
        },

        attachment: {
          type: "url",
          url: `https://vk.com/app${APP_ID}`,
          text: "Играть"
        }

      })

    } catch (e) {

      console.log("Story error:", e)
      alert("Ошибка сторис")

    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>🔥 Тайное мнение друзей</h1>

          <button style={styles.btn} onClick={() => setScreen("intro")}>
            👥 Начать
          </button>

          <button style={styles.btn} onClick={() => setScreen("inbox")}>
            ✉ Мои ответы
          </button>

          <button style={styles.btn} onClick={shareStory}>
            📲 Поделиться в сторис
          </button>

          <div style={styles.box}>

            <div style={styles.msg}>
              ❤️ Кто-то тайно влюблён в тебя
            </div>

            <div style={styles.msg}>
              🔥 Ты очень нравишься одному другу
            </div>

            <button style={styles.lock} onClick={buyVoices}>
              🔒 Узнать кто ответил — 3 голоса
            </button>

          </div>

        </div>

      </div>

    )

  }

  if (screen === "intro") {

    return (

      <div style={styles.bg}>
        <div style={styles.card}>

          <h2>Как это работает</h2>

          <button style={styles.btn} onClick={requestFriends}>
            Продолжить
          </button>

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>

        </div>
      </div>

    )

  }

  if (screen === "friends") {

    return (

      <div style={styles.bg}>
        <div style={styles.card}>

          <h2>Выбери друга</h2>

          <input
            placeholder="Поиск"
            style={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredFriends.map(f => (

            <div
              key={f.id}
              style={styles.friend}
              onClick={() => startQuiz(f)}
            >

              <img
                src={f.photo_100}
                style={styles.avatar}
              />

              {f.first_name}

            </div>

          ))}

        </div>
      </div>

    )

  }

  if (screen === "quiz" && selectedFriend) {

    const q = questions[qIndex]

    return (

      <div style={styles.bg}>
        <div style={styles.card}>

          <h2>{selectedFriend.first_name}</h2>

          <p>{q.q}</p>

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
      </div>

    )

  }

  if (screen === "result") {

    return (

      <div style={styles.bg}>
        <div style={styles.card}>

          <h2>Ответ отправлен</h2>

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            На главный экран
          </button>

        </div>
      </div>

    )

  }

  if (screen === "inbox") {

    return (

      <div style={styles.bg}>
        <div style={styles.card}>

          <h2>Ответы друзей</h2>

          {inbox.map((m, i) => (

            <div key={i} style={styles.msg}>
              {m}
            </div>

          ))}

        </div>
      </div>

    )

  }

  return null
}

const styles = {
  bg: { minHeight: "100vh", background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Inter" },
  container: { width: "360px", textAlign: "center", color: "white" },
  title: { fontSize: "34px", fontWeight: "700", marginBottom: "15px" },
  btn: { width: "100%", padding: "16px", marginTop: "12px", borderRadius: "40px", border: "none", background: "linear-gradient(90deg,#ff7aa2,#ff4ecd,#7a5cff)", color: "white", fontSize: "16px", cursor: "pointer" },
  card: { width: "340px", background: "rgba(255,255,255,0.15)", padding: "20px", borderRadius: "20px", color: "white" },
  search: { width: "100%", padding: "12px", borderRadius: "10px", border: "none" },
  friend: { display: "flex", alignItems: "center", gap: "10px", padding: "10px", background: "white", color: "#111", borderRadius: "12px", marginTop: "8px", cursor: "pointer" },
  avatar: { width: "40px", height: "40px", borderRadius: "50%" },
  answer: { width: "100%", padding: "14px", marginTop: "10px", border: "none", borderRadius: "12px", background: "#8b5cff", color: "white", cursor: "pointer" },
  msg: { background: "white", color: "#222", padding: "10px", borderRadius: "10px", marginTop: "8px" },
  box: { marginTop: "20px" },
  lock: { width: "100%", padding: "16px", marginTop: "12px", borderRadius: "40px", border: "none", background: "#ff4ecd", color: "white" }
}
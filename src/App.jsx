import React, { useState, useEffect } from "react"
import bridge from "@vkontakte/vk-bridge"

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
    { q: "Этот человек популярный?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он может предать?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он добрый?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он скрывает секрет?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он весёлый?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он кому-то сильно нравится?", a: ["Да", "Нет", "Возможно", "100%"] }

  ]

  async function requestFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends")
      const list = res.items || res.users || []

      setFriends(list)
      setFriendsError(false)
      setScreen("friends")

    } catch (e) {

      console.log(e)
      setFriendsError(true)
      alert("Нужно разрешить доступ к друзьям")

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

      alert("Покупка завершена")

    } catch (e) {

      console.log(e)

    }

  }

  async function shareStory() {

    try {

      const imageUrl = window.location.origin + "/story.png";

      await bridge.send("VKWebAppShowStoryBox", {
        background_type: "image",
        url: imageUrl
      })

    } catch (e) {

      console.log(e)
      alert("Ошибка сторис")

    }

  }
  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>🔥 Тайное мнение друзей</h1>

          <p style={styles.subtitle}>
            Узнай что друзья думают о тебе
          </p>

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

            <p>Пример сообщений</p>

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

          <p>
            Ты выбираешь друга и отвечаешь на вопросы.
            Ответы отправляются анонимно.
          </p>

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
            placeholder="Поиск друга"
            style={styles.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {friendsError && (

            <div>

              <p>Нужно разрешить доступ к друзьям</p>

              <button style={styles.btn} onClick={requestFriends}>
                Разрешить доступ
              </button>

            </div>

          )}

          {filteredFriends.map(f => (

            <div
              key={f.id}
              style={styles.friend}
              onClick={() => startQuiz(f)}
            >

              <img
                src={f.photo_100 || "https://vk.com/images/camera_200.png"}
                style={styles.avatar}
              />

              {f.first_name}

            </div>

          ))}

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>

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

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>

        </div>

      </div>

    )

  }

}

const styles = {

  bg: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Arial",
    padding: "20px"
  },

  container: {
    width: "360px",
    textAlign: "center",
    color: "white"
  },

  title: {
    fontSize: "34px",
    fontWeight: "700",
    marginBottom: "8px",
    textShadow: "0 5px 20px rgba(0,0,0,0.25)"
  },

  subtitle: {
    opacity: 0.9,
    marginBottom: "25px",
    fontSize: "16px"
  },

  btn: {
    width: "100%",
    padding: "18px",
    marginTop: "14px",
    borderRadius: "50px",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    background: "linear-gradient(90deg,#ff7aa2,#ff4ecd,#7a5cff)",
    color: "white",
    fontWeight: "600",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
  },

  search: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "14px",
    border: "none",
    fontSize: "15px"
  },

  box: {
    marginTop: "25px",
    background: "rgba(255,255,255,0.15)",
    padding: "18px",
    borderRadius: "22px",
    backdropFilter: "blur(15px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
  },

  msg: {
    background: "white",
    color: "#222",
    padding: "12px",
    borderRadius: "14px",
    marginTop: "10px",
    fontWeight: "500"
  },

  lock: {
    width: "100%",
    padding: "16px",
    marginTop: "14px",
    borderRadius: "40px",
    border: "none",
    background: "linear-gradient(90deg,#ff9a9e,#ff4ecd,#7a5cff)",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 8px 25px rgba(0,0,0,0.25)"
  },

  card: {
    width: "340px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    padding: "22px",
    borderRadius: "24px",
    color: "white",
    boxShadow: "0 8px 35px rgba(0,0,0,0.3)"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "white",
    color: "#111",
    borderRadius: "14px",
    marginTop: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%"
  },

  answer: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(90deg,#ff8a9a,#ff3cac,#8b5cff)",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
  }

}
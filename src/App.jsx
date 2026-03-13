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

      const res = await bridge.send("VKWebAppGetFriends", { fields: "photo_100" })

      setFriends(res.items || [])

      setScreen("friends")

    } catch (e) {

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

    try {

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "gradient",

        background_color: "ff4ecd",

        attachment: {
          type: "url",
          url: `https://vk.com/appXXXX`
        },

        link_text: "Ответить"

      })

    } catch (e) {

      console.log(e)

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
            Начать
          </button>

          <button style={styles.btn} onClick={() => setScreen("inbox")}>
            Мои ответы
          </button>

          <button style={styles.btn} onClick={shareStory}>
            Поделиться в сторис
          </button>

        </div>

      </div>

    )

  }

  if (screen === "intro") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Как работает приложение</h2>

          <p>
            Выберите друга и ответьте на несколько вопросов.
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
                src={f.photo_100}
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
            Главная
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
              <button style={styles.lock} onClick={buyVoices}>
                Узнать кто ответил — 3 голоса
              </button>
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
    background: "linear-gradient(160deg,#6a3cff,#ff6aa6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial"
  },

  container: {
    width: "360px",
    textAlign: "center",
    color: "white"
  },

  card: {
    width: "340px",
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "20px",
    color: "white"
  },

  btn: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    borderRadius: "40px",
    border: "none",
    background: "#ff4ecd",
    color: "white",
    fontSize: "16px"
  },

  search: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "12px",
    border: "none"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "8px",
    cursor: "pointer"
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%"
  },

  answer: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    border: "none",
    borderRadius: "14px",
    background: "#ff4ecd",
    color: "white"
  },

  msg: {
    background: "white",
    color: "#222",
    padding: "12px",
    borderRadius: "12px",
    marginTop: "10px"
  },

  lock: {
    marginTop: "10px",
    padding: "10px",
    border: "none",
    borderRadius: "10px",
    background: "#ff4ecd",
    color: "white"
  }

}
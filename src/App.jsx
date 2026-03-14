import React, { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";
import { supabase } from "./supabase";

export default function App() {

  const [screen, setScreen] = useState("menu")
  const [user, setUser] = useState(null)

  const [friends, setFriends] = useState([])
  const [search, setSearch] = useState("")

  const [selectedFriend, setSelectedFriend] = useState(null)

  const [qIndex, setQIndex] = useState(0)
  const [inbox, setInbox] = useState([])

  useEffect(() => {

    async function init() {

      try {

        await bridge.send("VKWebAppInit")

        const userInfo = await bridge.send("VKWebAppGetUserInfo")

        setUser(userInfo)

        loadInbox(userInfo.id)

      } catch (e) {
        console.log("VK init error", e)
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

  async function loadInbox(userId) {

    try {

      const { data } = await supabase
        .from("answers")
        .select("*")
        .eq("target_user", userId)

      if (data) {

        const msgs = data.map(a => `${a.question} — ${a.answer}`)

        setInbox(msgs)

      }

    } catch (e) {
      console.log(e)
    }

  }

  async function openInbox() {

    if (!user) return

    await loadInbox(user.id)

    setScreen("inbox")

  }

  async function requestFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends")

      const list = res.items || res.users || []

      setFriends(list)

      setScreen("friends")

    } catch (e) {

      console.log(e)
      alert("Разрешите доступ к друзьям")

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

    setScreen("quiz")

  }

  async function answerClick(a) {

    if (!user || !selectedFriend) return

    const question = questions[qIndex].q

    try {

      await supabase.from("answers").insert({

        target_user: selectedFriend.id,
        from_user: user.id,
        question: question,
        answer: a

      })

    } catch (e) {
      console.log(e)
    }

    if (qIndex < questions.length - 1) {

      setQIndex(prev => prev + 1)

    } else {

      setScreen("result")

    }

  }

  async function shareStory() {

    try {

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "image",

        background_url:
          "https://friend-opinion-app-o7ah.vercel.app/story.png",

        open_url:
          "https://vk.com/app54474085"

      })

    } catch (e) {

      console.log("Story error", e)

      alert("Ошибка сторис")

    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>
            🔥 Тайное мнение друзей
          </h1>

          <p style={styles.subtitle}>
            Узнай что друзья думают о тебе
          </p>

          <button style={styles.btn}
            onClick={() => setScreen("intro")}>
            👥 Начать
          </button>

          <button style={styles.btn}
            onClick={openInbox}>
            ✉ Мои ответы
          </button>

          <button style={styles.btn}
            onClick={shareStory}>
            📲 Поделиться в сторис
          </button>

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
            Выбери друга и ответь на вопросы.
            Ответ будет отправлен анонимно.
          </p>

          <button style={styles.btn}
            onClick={requestFriends}>
            Продолжить
          </button>

          <button style={styles.btn}
            onClick={() => setScreen("menu")}>
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

            <div key={f.id}
              style={styles.friend}
              onClick={() => startQuiz(f)}>

              <img
                src={f.photo_100 ||
                  "https://vk.com/images/camera_200.png"}
                style={styles.avatar}
              />

              {f.first_name}

            </div>

          ))}

          <button style={styles.btn}
            onClick={() => setScreen("menu")}>
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

            <button key={i}
              style={styles.answer}
              onClick={() => answerClick(a)}>
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

          <button style={styles.btn}
            onClick={() => setScreen("menu")}>
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

          <h2>Ответы</h2>

          {inbox.length === 0 &&
            <div style={styles.msg}>
              Пока нет ответов
            </div>
          }

          {inbox.map((m, i) => (

            <div key={i} style={styles.msg}>
              {m}
            </div>

          ))}

          <button style={styles.btn}
            onClick={() => setScreen("menu")}>
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
    fontFamily: "Arial",
    padding: "20px"
  },

  container: {
    width: "360px",
    textAlign: "center",
    color: "white"
  },

  title: {
    fontSize: "34px",
    fontWeight: "700"
  },

  subtitle: {
    marginBottom: "20px"
  },

  btn: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    borderRadius: "40px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    background: "#ff4ecd",
    color: "white"
  },

  search: {
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    marginBottom: "10px"
  },

  card: {
    width: "340px",
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "20px",
    color: "white"
  },

  msg: {
    background: "white",
    color: "#111",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "8px"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    background: "white",
    color: "#111",
    borderRadius: "12px",
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
    borderRadius: "12px",
    background: "#ff4ecd",
    color: "white",
    cursor: "pointer"
  }

}
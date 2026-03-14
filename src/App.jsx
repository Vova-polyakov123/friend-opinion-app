import React, { useState, useEffect } from "react"
import bridge from "@vkontakte/vk-bridge"

export default function App() {

  const [screen, setScreen] = useState("menu")
  const [user, setUser] = useState(null)

  const [friends, setFriends] = useState([])
  const [friendsError, setFriendsError] = useState(false)
  const [search, setSearch] = useState("")

  const [selectedFriend, setSelectedFriend] = useState(null)

  const [qIndex, setQIndex] = useState(0)

  const questions = [

    { q: "Этот человек тайно в кого-то влюблён?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он нравится противоположному полу?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Можно ли ему доверять?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он хороший друг?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Этот человек популярный?", a: ["Да", "Нет", "Возможно", "100%"] }

  ]

  useEffect(() => {

    async function init() {

      await bridge.send("VKWebAppInit")

      const userInfo = await bridge.send("VKWebAppGetUserInfo")
      setUser(userInfo)

    }

    init()

  }, [])

  async function requestFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends")

      setFriends(res.items || [])
      setFriendsError(false)

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
    setScreen("quiz")

  }

  function answerClick() {

    if (qIndex < questions.length - 1) {

      setQIndex(qIndex + 1)

    } else {

      setScreen("result")

    }

  }

  async function buyAnswers() {

    try {

      await bridge.send("VKWebAppShowOrderBox", {

        type: "item",
        item: "answers"

      })

    } catch (e) {

      console.log(e)

    }

  }

  async function shareStory() {

    try {

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "image",
        url: "https://i.imgur.com/8Km9tLL.png",

        attachment: {
          type: "url",
          url: `https://vk.com/appXXXX`,
          text: "to_store"
        }

      })

    } catch (e) {

      console.log(e)

    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>Тайное мнение друзей</h1>

          <button style={styles.btn} onClick={() => setScreen("intro")}>
            Начать
          </button>

          <button style={styles.btn} onClick={shareStory}>
            Поделиться в сторис
          </button>

          <div style={styles.box}>

            <div style={styles.msg}>💌 Кто-то тайно влюблён в тебя</div>
            <div style={styles.msg}>🔥 Ты нравишься одному другу</div>

            <button style={styles.lock} onClick={buyAnswers}>
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

            Выберите друга и ответьте на несколько вопросов.
            Ответы будут отправлены анонимно.

            Для этого потребуется доступ к списку друзей.

          </p>

          <button style={styles.btn} onClick={requestFriends}>
            Разрешить доступ к друзьям
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
            style={styles.search}
            placeholder="Поиск"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {friendsError && (

            <div>

              <p>Нужно разрешить доступ к друзьям</p>

              <button style={styles.btn} onClick={requestFriends}>
                Попробовать снова
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

        </div>

      </div>

    )

  }

  if (screen === "quiz") {

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
              onClick={answerClick}
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

          <p>Друг сможет увидеть ответ в приложении</p>

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            На главную
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
    fontSize: "30px",
    marginBottom: "20px"
  },

  btn: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    borderRadius: "40px",
    border: "none",
    fontSize: "16px",
    background: "#ff4ecd",
    color: "white",
    cursor: "pointer"
  },

  card: {
    width: "340px",
    background: "rgba(255,255,255,0.15)",
    padding: "20px",
    borderRadius: "20px",
    color: "white"
  },

  box: {
    marginTop: "20px"
  },

  msg: {
    background: "white",
    color: "#111",
    padding: "12px",
    borderRadius: "12px",
    marginTop: "10px"
  },

  lock: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    borderRadius: "40px",
    border: "none",
    background: "#ff6aa6",
    color: "white",
    cursor: "pointer"
  },

  search: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    marginTop: "10px"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    color: "#111",
    padding: "10px",
    borderRadius: "12px",
    marginTop: "10px",
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
    borderRadius: "12px",
    border: "none",
    background: "#7a5cff",
    color: "white",
    cursor: "pointer"
  }

}
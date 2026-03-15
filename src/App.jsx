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

  function buyVoices() {
    alert("Функция покупки голосов пока не подключена")
  }

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

  async function shareStory() {

    try {

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "gradient",
        background_color: "#6a3cff",
        background_color_bottom: "#ff6aa6",

        attachment: {
          type: "url",
          url: `https://vk.com/appXXXX#${user?.id}`,
          text: "Пройди анонимный опрос обо мне"
        }

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

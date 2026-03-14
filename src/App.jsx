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

    "Этот человек тайно в кого-то влюблён?",
    "Он нравится противоположному полу?",
    "Можно ли ему доверять?",
    "Он хороший друг?",
    "Этот человек популярный?",
    "Он может предать?",
    "Он добрый?",
    "Он скрывает секрет?",
    "Он весёлый?",
    "Он кому-то сильно нравится?"

  ]

  async function requestFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends")

      if (!res.items) {
        setFriendsError(true)
        return
      }

      setFriends(res.items)
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

  function answer() {

    if (qIndex < questions.length - 1) {

      setQIndex(qIndex + 1)

    } else {

      setScreen("result")

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
          text: "more"
        }

      })

    } catch (e) {

      console.log(e)

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

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h1>🔥 Тайное мнение друзей</h1>

          <p>Ответь на вопросы о друзьях</p>

          <button style={styles.btn} onClick={() => setScreen("intro")}>
            Начать
          </button>

          <button style={styles.btn} onClick={shareStory}>
            Поделиться
          </button>

        </div>

      </div>

    )

  }

  if (screen === "intro") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Нужно разрешение</h2>

          <p>
            Чтобы выбрать друга для опроса,
            приложение должно получить список друзей
          </p>

          <button style={styles.btn} onClick={requestFriends}>
            Разрешить доступ
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
            onChange={e => setSearch(e.target.value)}
          />

          {friendsError && (

            <div>

              <p>Нужно разрешить доступ</p>

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

        </div>

      </div>

    )

  }

  if (screen === "quiz") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>{selectedFriend.first_name}</h2>

          <p>{questions[qIndex]}</p>

          <button style={styles.answer} onClick={answer}>Да</button>
          <button style={styles.answer} onClick={answer}>Нет</button>
          <button style={styles.answer} onClick={answer}>Возможно</button>

        </div>

      </div>

    )

  }

  if (screen === "result") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Ответ отправлен</h2>

          <button style={styles.btn} onClick={buyVoices}>
            🔒 Узнать кто ответил — 3 голоса
          </button>

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            На главный экран
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
    alignItems: "center"
  },

  card: {
    width: "340px",
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    textAlign: "center"
  },

  btn: {
    width: "100%",
    padding: "15px",
    marginTop: "10px",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer"
  },

  search: {
    width: "100%",
    padding: "10px",
    marginTop: "10px"
  },

  friend: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    padding: "10px",
    background: "#eee",
    marginTop: "8px",
    borderRadius: "10px",
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
    marginTop: "8px"
  }

}

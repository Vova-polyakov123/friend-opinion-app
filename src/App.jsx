import React, { useState, useEffect } from "react"
import bridge from "@vkontakte/vk-bridge"
import { Button } from "@vkontakte/vkui"

export default function App() {

  const [screen, setScreen] = useState("menu")
  const [user, setUser] = useState(null)

  const [friends, setFriends] = useState([])
  const [search, setSearch] = useState("")

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

      setFriends(res.items || [])

      setScreen("friends")

    } catch (e) {

      alert("Разреши доступ к друзьям")

    }

  }

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
        background_type: "image",
        url: "https://vk.com/images/camera_200.png"
      })

    } catch (error) {

      console.log(error)
      alert("Открой приложение внутри VK")

    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>🔥 Тайное мнение друзей</h1>

          <p style={styles.subtitle}>Узнай что друзья думают о тебе</p>

          <Button size="l" stretched style={{ marginTop: 10 }} onClick={() => setScreen("intro")}>
            👥 Начать
          </Button>

          <Button size="l" stretched style={{ marginTop: 10 }} onClick={() => setScreen("inbox")}>
            ✉ Мои ответы
          </Button>

          <Button size="l" stretched style={{ marginTop: 10 }} onClick={shareStory}>
            📲 Поделиться в сторис
          </Button>

        </div>

      </div>

    )

  }

  if (screen === "result") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h2>Ответ отправлен</h2>

          <Button size="l" stretched style={{ marginTop: 10 }} onClick={shareStory}>
            📲 Поделиться в сторис
          </Button>

          <Button size="l" stretched style={{ marginTop: 10 }} onClick={() => setScreen("menu")}>
            На главный экран
          </Button>

        </div>

      </div>

    )

  }

  return (
    <div style={styles.bg}>
      <div style={styles.container}>
        <Button size="l" stretched onClick={() => setScreen("menu")}>
          Назад
        </Button>
      </div>
    </div>
  )

}

const styles = {

  bg: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
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
  }

}
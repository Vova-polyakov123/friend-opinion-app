import { useEffect, useState } from "react"
import bridge from "@vkontakte/vk-bridge"

import Home from "./pages/Home"
import Quiz from "./pages/Quiz"
import Results from "./pages/Results"
import Profile from "./pages/Profile"
import Leaderboard from "./pages/Leaderboard"

import "./style.css"

function App() {

  const [user, setUser] = useState(null)
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState("home")
  const [error, setError] = useState(null)

  const [selectedFriend, setSelectedFriend] = useState(null)

  const [answers, setAnswers] = useState([])

  useEffect(() => {

    initApp()

  }, [])


  async function initApp() {

    try {

      await bridge.send("VKWebAppInit")

      const userData = await bridge.send("VKWebAppGetUserInfo")

      setUser(userData)

      const friendsData = await bridge.send("VKWebAppCallAPIMethod", {

        method: "friends.get",

        params: {
          fields: "photo_100",
          v: "5.131"
        }

      })

      if (friendsData.response) {

        setFriends(friendsData.response.items)

      }

    } catch (e) {

      console.error(e)

      setError("Ошибка загрузки VK данных")

    }

    setLoading(false)

  }



  function navigate(pageName) {

    setPage(pageName)

  }



  function selectFriend(friend) {

    setSelectedFriend(friend)

    setPage("quiz")

  }



  function addAnswer(answer) {

    setAnswers(prev => [...prev, answer])

  }



  function resetGame() {

    setSelectedFriend(null)

    setPage("home")

  }



  function renderPage() {

    if (page === "home") {

      return (

        <Home
          user={user}
          friends={friends}
          start={() => navigate("quiz")}
          openProfile={() => navigate("profile")}
          openLeaderboard={() => navigate("leaderboard")}
          selectFriend={selectFriend}
        />

      )

    }


    if (page === "quiz") {

      return (

        <Quiz
          user={user}
          friend={selectedFriend}
          addAnswer={addAnswer}
          finish={() => navigate("results")}
          goBack={() => navigate("home")}
        />

      )

    }


    if (page === "results") {

      return (

        <Results
          user={user}
          answers={answers}
          restart={resetGame}
        />

      )

    }


    if (page === "profile") {

      return (

        <Profile
          user={user}
          answers={answers}
          goHome={() => navigate("home")}
        />

      )

    }


    if (page === "leaderboard") {

      return (

        <Leaderboard
          friends={friends}
          goHome={() => navigate("home")}
        />

      )

    }

  }



  if (loading) {

    return (

      <div className="loading">

        <h2>Загрузка приложения...</h2>

      </div>

    )

  }


  if (error) {

    return (

      <div className="error">

        <h2>{error}</h2>

        <button onClick={initApp}>
          Перезагрузить
        </button>

      </div>

    )

  }



  return (

    <div className="app">

      <header className="header">

        <h1>Friend Secret</h1>

        {user && (

          <div className="user">

            <img
              src={user.photo_100}
              alt="avatar"
            />

            <span>

              {user.first_name}

            </span>

          </div>

        )}

      </header>


      <main className="content">

        {renderPage()}

      </main>


      <footer className="footer">

        <button onClick={() => navigate("home")}>

          Главная

        </button>

        <button onClick={() => navigate("profile")}>

          Профиль

        </button>

        <button onClick={() => navigate("leaderboard")}>

          Топ

        </button>

      </footer>

    </div>

  )

}

export default App
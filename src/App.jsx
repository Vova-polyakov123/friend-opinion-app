import React, { useEffect, useState } from "react";
import bridge from "@vkontakte/vk-bridge";
import { supabase } from "./supabase";

export default function App() {

  const [screen, setScreen] = useState("menu");
  const [user, setUser] = useState(null);

  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedFriend, setSelectedFriend] = useState(null);

  const [qIndex, setQIndex] = useState(0);
  const [inbox, setInbox] = useState([]);

  const questions = [

    { q: "Этот человек тайно в кого-то влюблён?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он нравится противоположному полу?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Можно ли ему доверять?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Он хороший друг?", a: ["Да", "Нет", "Возможно", "100%"] },
    { q: "Этот человек популярный?", a: ["Да", "Нет", "Возможно", "100%"] }

  ];

  useEffect(() => {

    async function init() {

      try {

        await bridge.send("VKWebAppInit");

        const userInfo = await bridge.send("VKWebAppGetUserInfo");

        setUser(userInfo);

        loadInbox(userInfo.id);

      } catch (e) {

        console.log(e);

      }

    }

    init();

  }, []);

  async function loadInbox(userId) {

    const { data } = await supabase
      .from("answers")
      .select("*")
      .eq("target_user", userId);

    if (data) {

      const msgs = data.map(a => `${a.question} — ${a.answer}`);

      setInbox(msgs);

    }

  }

  async function requestFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends");

      const list = res.items || res.users || [];

      setFriends(list);

      setScreen("friends");

    } catch (e) {

      alert("Разрешите доступ к друзьям");

    }

  }

  const filteredFriends = friends.filter(f =>
    (f.first_name + " " + (f.last_name || ""))
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function startQuiz(friend) {

    setSelectedFriend(friend);

    setQIndex(0);

    setScreen("quiz");

  }

  async function answerClick(a) {

    if (!user || !selectedFriend) return;

    const question = questions[qIndex].q;

    await supabase.from("answers").insert({

      target_user: selectedFriend.id,
      from_user: user.id,
      question: question,
      answer: a

    });

    if (qIndex < questions.length - 1) {

      setQIndex(qIndex + 1);

    } else {

      setScreen("result");

    }

  }

  async function shareStory() {

    try {

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "image",

        url: "https://friend-opinion-app-skew.vercel.app/story.png",

        action_text: {
          text: "Играть",
          style: "poster"
        }

      });

    } catch (e) {

      console.log(e);

      alert("Ошибка сторис");

    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1>🔥 Тайное мнение друзей</h1>

          <button style={styles.btn}
            onClick={() => setScreen("intro")}>
            Начать
          </button>

          <button style={styles.btn}
            onClick={() => loadInbox(user.id)}>
            Мои ответы
          </button>

          <button style={styles.btn}
            onClick={shareStory}>
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

          <h2>Как это работает</h2>

          <p>
            Выбирай друга и отвечай на вопросы.
            Ответ будет анонимный.
          </p>

          <button style={styles.btn}
            onClick={requestFriends}>
            Продолжить
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
            value={search}
            style={styles.search}
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

  if (screen === "quiz") {

    const q = questions[qIndex];

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

          <button
            style={styles.btn}
            onClick={() => setScreen("menu")}
          >
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

          {inbox.map((m, i) => (

            <div key={i} style={styles.msg}>
              {m}
            </div>

          ))}

          <button
            style={styles.btn}
            onClick={() => setScreen("menu")}
          >
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(160deg,#6a3cff,#ff6aa6)",
    fontFamily: "Arial"
  },

  container: {
    width: "340px",
    textAlign: "center",
    color: "white"
  },

  card: {
    width: "340px",
    padding: "20px",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "20px",
    color: "white"
  },

  btn: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    borderRadius: "40px",
    border: "none",
    background: "#ff4ecd",
    color: "white",
    cursor: "pointer"
  },

  search: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    marginBottom: "10px"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    background: "white",
    color: "#111",
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
    borderRadius: "12px",
    background: "#ff4ecd",
    color: "white"
  },

  msg: {
    background: "white",
    color: "#111",
    padding: "10px",
    borderRadius: "10px",
    marginTop: "8px"
  }

};
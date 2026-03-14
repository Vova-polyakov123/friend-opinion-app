import React, { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function App() {

  const [screen, setScreen] = useState("menu");
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);

  useEffect(() => {

    async function loadUser() {

      try {

        const user = await bridge.send("VKWebAppGetUserInfo");
        setUser(user);

      } catch (e) {

        console.log(e);

      }

    }

    loadUser();

  }, []);

  async function getFriends() {

    try {

      const res = await bridge.send("VKWebAppGetFriends");
      setFriends(res.items || []);

      setScreen("friends");

    } catch (e) {

      alert("Нужно разрешить доступ к друзьям");

    }

  }

  if (screen === "menu") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h1>🔥 Тайное мнение</h1>

          <p>Узнай что друзья думают о тебе</p>

          <button style={styles.btn} onClick={getFriends}>
            Начать
          </button>

        </div>

      </div>

    );

  }

  if (screen === "friends") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Друзья</h2>

          {friends.map(f => (

            <div key={f.id} style={styles.friend}>

              <img src={f.photo_100} style={styles.avatar} />

              {f.first_name}

            </div>

          ))}

          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>

        </div>

      </div>

    );

  }

}

const styles = {

  bg: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial"
  },

  card: {
    width: "320px",
    padding: "20px",
    background: "white",
    borderRadius: "20px",
    textAlign: "center"
  },

  btn: {
    width: "100%",
    padding: "15px",
    marginTop: "15px",
    border: "none",
    borderRadius: "40px",
    fontSize: "16px",
    cursor: "pointer",
    background: "#7a5cff",
    color: "white"
  },

  friend: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
    padding: "10px",
    background: "#f2f2f2",
    borderRadius: "10px"
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%"
  }

};

import React, { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function App() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [friendsAccess, setFriendsAccess] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [paid, setPaid] = useState(false);

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
    { q: "Он кому-то сильно нравится?", a: ["Да", "Нет", "Возможно", "100%"] },
  ];

  useEffect(() => {
    async function initApp() {
      try {
        await bridge.send("VKWebAppInit");
        console.log("VKWebAppInit completed");

        const u = await bridge.send("VKWebAppGetUserInfo");
        setUser(u);
        console.log("VKWebAppGetUserInfo completed", u);

        setScreen("menu"); // Переходим на главное меню после успешной инициализации
      } catch (error) {
        console.error("Initialization failed:", error);
        // Если любая из частей инициализации не удалась, показываем экран ошибки
        setScreen("error");
      }
    }
    initApp();
  }, []);

  async function requestFriendsAccess() {
    setScreen("loading");
    try {
      const res = await bridge.send("VKWebAppGetFriends");
      const friendList = res.items || [];
      setFriends(friendList);
      setFriendsAccess(true);
      setScreen("friends");
      console.log("VKWebAppGetFriends successful", friendList);
    } catch (error) {
      console.error("VKWebAppGetFriends failed:", error);
      setFriendsAccess(false);
      // Если была ошибка отказа в доступе, показываем специальный экран
      if (error.error_type === "permission_denied") {
        setScreen("no_friends_access");
      } else {
        setScreen("error"); // Для других ошибок показываем общий экран ошибки
      }
    }
  }

  // ... (остальной код приложения, включая рендеринг экранов)
  // ... (экран ошибки и остальные экраны должны быть объявлены)

  // Экран общей ошибки (должен быть реализован)
  if (screen === "error") {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <h1 style={styles.title}>Ошибка загрузки</h1>
          <p style={styles.subtitle}>Не удалось инициализировать приложение. Проверьте подключение или повторите попытку.</p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  // Остальные экраны (loading, menu, intro, no_friends_access, friends, quiz, result, inbox)
  // ...

  if (screen === "loading") {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <h1 style={styles.title}>Загрузка...</h1>
        </div>
      </div>
    );
  }

  if (screen === "menu") {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <h1 style={styles.title}>Тайное мнение друзей</h1>
          <button style={styles.btn} onClick={() => setScreen("intro")}>
            Начать
          </button>
          <button style={styles.btn} onClick={() => setScreen("inbox")}>
            ✉ Мои ответы
          </button>
        </div>
      </div>
    );
  }

  // ... (реализация остальных экранов)

  return null; // Возвращаем null, пока не определен текущий экран
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter",
    padding: "20px",
  },
  container: {
    width: "360px",
    textAlign: "center",
    color: "white",
  },
  title: {
    fontSize: "34px",
    fontWeight: "700",
  },
  subtitle: {
    marginBottom: "20px",
  },
  btn: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    borderRadius: "40px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    background: "linear-gradient(90deg,#ff7aa2,#ff4ecd,#7a5cff)",
    color: "white",
  },
  // ... (остальные стили)
};

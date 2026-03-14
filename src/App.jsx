import React, { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [friendsAccess, setFriendsAccess] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [paid, setPaid] = useState(false);

  // Список вопросов для опроса
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

  // Инициализация приложения и получение информации о пользователе
  useEffect(() => {
    async function init() {
      await bridge.send("VKWebAppInit");
      try {
        const u = await bridge.send("VKWebAppGetUserInfo");
        setUser(u);
      } catch (e) {
        console.error("Ошибка получения информации о пользователе:", e);
        // Обработка ошибки, если пользователь не авторизован или есть проблемы с доступом
      }
    }
    init();
  }, []);

  // Запрос доступа к списку друзей
  async function requestFriends() {
    try {
      const res = await bridge.send("VKWebAppGetFriends");
      const list = res.items || [];
      setFriends(list);
      setFriendsAccess(true);
      setScreen("friends");
    } catch (e) {
      console.error("Ошибка доступа к друзьям:", e);
      setFriendsAccess(false);
      // Здесь можно отобразить сообщение пользователю о необходимости предоставления доступа
    }
  }

  // Фильтрация списка друзей по поисковому запросу
  const filteredFriends = friends.filter(
    (f) =>
      (f.first_name + " " + (f.last_name || ""))
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // Начало опроса для выбранного друга
  function startQuiz(friend) {
    setSelectedFriend(friend);
    setQIndex(0);
    setAnswers([]);
    setScreen("quiz");
  }

  // Обработка выбора ответа
  function answerClick(a) {
    setAnswers((prev) => [...prev, a]);

    if (qIndex < questions.length - 1) {
      setQIndex((prev) => prev + 1);
    } else {
      // Сохранение ответа (в реальном приложении здесь будет отправка на сервер)
      setInbox((prev) => [
        ...prev,
        {
          text: `💌 Кто-то ответил про ${selectedFriend.first_name}`, // Отображаем имя выбранного друга
          locked: true,
          friendId: selectedFriend.id, // Сохраняем ID друга
          answers: [...answers, a], // Сохраняем ответы
        },
      ]);
      setScreen("result");
    }
  }

  // Покупка разблокировки ответов
  async function buyVoices() {
    try {
      await bridge.send("VKWebAppShowOrderBox", {
        type: "item",
        item: "answers_unlock",
      });
      setPaid(true);
      setInbox((prev) => prev.map((x) => ({ ...x, locked: false })));
    } catch (e) {
      console.error("Ошибка при покупке:", e);
    }
  }

  // Функция для отправки сторис
  async function shareStory() {
    try {
      // Формируем текст для сторис
      // В этом примере, мы просто берем первое, что приходит.
      // В реальном приложении, здесь может генерироваться более сложный текст,
      // например, содержащий результат или приглашение пройти опрос.
      const storyText = "Узнай, что о тебе думают друзья!";
      const appUrl = "https://vk.com/app54474085"; // Замените XXXX на ID вашего приложения

      await bridge.send("VKWebAppShowStoryBox", {
        // Для большей универсальности, можно использовать background_type: "image"
        // и передавать ссылку на сгенерированное изображение с результатами.
        // В данном случае, используем простой фон.
        background_type: "color",
        color: "#7A3CFF", // Фиолетовый цвет, подходящий под дизайн

        attachment: {
          name: "link",
          url: appUrl,
          text_color: "#FFFFFF", // Цвет текста на кнопке
          caption: "Перейти в приложение", // Текст на кнопке
        },
      });
    } catch (e) {
      console.error("Ошибка при отправке сторис:", e);
      // Здесь можно показать уведомление пользователю об ошибке.
    }
  }

  // --- Рендеринг экранов ---

  // Главное меню
  if (screen === "menu") {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <h1 style={styles.title}>🔥 Тайное мнение друзей</h1>
          <p style={styles.subtitle}>Узнай что друзья думают о тебе</p>
          <button style={styles.btn} onClick={() => setScreen("intro")}>
            👥 Начать
          </button>
          <button style={styles.btn} onClick={() => setScreen("inbox")}>
            ✉ Мои ответы
          </button>
          <button style={styles.btn} onClick={shareStory}>
            📲 Поделиться
          </button>
        </div>
      </div>
    );
  }

  // Экран введения
  if (screen === "intro") {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Как работает приложение</h2>
          <p>
            Вы выбираете друга из списка и отвечаете на вопросы. Ответы приходят
            анонимно.
          </p>
          <p>
            Чтобы выбрать друга, нужно разрешить доступ к списку друзей.
          </p>
          <button style={styles.btn} onClick={requestFriends}>
            Продолжить
          </button>
          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Экран запроса доступа к друзьям (если доступ не предоставлен)
  if (friendsAccess === false) {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Нужен доступ к друзьям</h2>
          <p>Без доступа нельзя выбрать друга для опроса.</p>
          <button style={styles.btn} onClick={requestFriends}>
            Разрешить доступ
          </button>
          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Экран списка друзей
  if (screen === "friends") {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Выберите друга</h2>
          <input
            style={styles.search}
            placeholder="Поиск"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filteredFriends.map((f) => (
            <div key={f.id} style={styles.friend} onClick={() => startQuiz(f)}>
              <img src={f.photo_100} style={styles.avatar} alt={f.first_name} />
              {f.first_name} {f.last_name}
            </div>
          ))}
          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Экран самого опроса
  if (screen === "quiz" && selectedFriend) {
    const q = questions[qIndex];
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>{selectedFriend.first_name}</h2>
          <p>{q.q}</p>
          {q.a.map((a, i) => (
            <button key={i} style={styles.answer} onClick={() => answerClick(a)}>
              {a}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Экран результата после прохождения опроса
  if (screen === "result") {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Ответ отправлен</h2>
          <p>Спасибо за участие!</p>
          <button style={styles.btn} onClick={() => setScreen("menu")}>
            На главный экран
          </button>
        </div>
      </div>
    );
  }

  // Экран входящих ответов
  if (screen === "inbox") {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Ответы друзей</h2>
          {inbox.length === 0 && <p>Пока никто не ответил на твои вопросы.</p>}
          {inbox.map((m, i) => (
            <div key={i} style={styles.msg}>
              {m.text}
              {m.locked && !paid && (
                <button style={styles.lock} onClick={buyVoices}>
                  🔒 Узнать кто — 3 голоса
                </button>
              )}
            </div>
          ))}
          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>
        </div>
      </div>
    );
  }

  // Возвращаем null или сообщение об ошибке, если текущий экран не найден
  return null; // Или <div style={styles.bg}>Ошибка загрузки...</div>
}

// Стили для компонентов (оставлены без изменений)
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
  card: {
    width: "340px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    padding: "20px",
    borderRadius: "20px",
    color: "white",
  },
  search: {
    width: "100%",
    padding: "10px",
    borderRadius: "12px",
    border: "none",
    marginTop: "10px",
  },
  friend: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    color: "#111",
    padding: "10px",
    borderRadius: "12px",
    marginTop: "8px",
    cursor: "pointer",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },
  answer: {
    width: "100%",
    padding: "14px",
    marginTop: "10px",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(90deg,#ff8a9a,#ff3cac,#8b5cff)",
    color: "white",
    cursor: "pointer",
  },
  msg: {
    background: "white",
    color: "#222",
    padding: "12px",
    borderRadius: "12px",
    marginTop: "10px",
  },
  lock: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    border: "none",
    borderRadius: "30px",
    background: "#ff4ecd",
    color: "white",
    cursor: "pointer",
  },
};

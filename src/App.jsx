import React, { useState, useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";

export default function App() {
  const [screen, setScreen] = useState("loading"); // Начинаем с загрузки
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [friendsError, setFriendsError] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [appId, setAppId] = useState(null); // Для хранения ID приложения

  useEffect(() => {
    async function init() {
      try {
        // Получаем ID приложения VK, когда оно инициализируется
        const initData = await bridge.send("VKWebAppInit");
        // Проверяем, есть ли ID приложения в данных инициализации
        if (initData && initData.app_id) {
          setAppId(initData.app_id);
        } else {
          // Если нет, пытаемся получить через переменную окружения (если используется CRA)
          // или можно прямо вписать ID, если он известен
          setAppId(import.meta.env.REACT_APP_VK_APP_ID || "ВАШ_ID_ПРИЛОЖЕНИЯ");
        }

        const userInfo = await bridge.send("VKWebAppGetUserInfo");
        setUser(userInfo);
        setScreen("menu"); // После успешной инициализации и получения пользователя переходим в меню
      } catch (error) {
        console.error("Ошибка инициализации:", error);
        setScreen("error"); // Переходим на экран ошибки при любой проблеме с инициализацией
      }
    }
    init();
  }, []);

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
  ];

  async function requestFriends() {
    setScreen("loading"); // Показываем загрузку перед запросом
    try {
      const res = await bridge.send("VKWebAppGetFriends", { fields: "photo_100" }); // Запрашиваем фото
      const list = res.items || res.users || [];
      setFriends(list);
      setFriendsError(false);
      setScreen("friends");
    } catch (e) {
      console.error("Ошибка получения друзей:", e);
      // Если ошибка связана с доступом, переводим на экран без доступа
      if (e.code === 403 || e.error_reason === "authorization_error") {
        setScreen("no_friends_access");
      } else {
        setFriendsError(true);
        setScreen("friends"); // Оставляем на экране друзей, но с ошибкой
      }
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
    setAnswers([]);
    setScreen("quiz");
  }

  function answerClick(a) {
    setAnswers(prev => [...prev, a]);
    if (qIndex < questions.length - 1) {
      setQIndex(prev => prev + 1);
    } else {
      // Здесь можно отправить собранные ответы друга куда-то (например, на сервер)
      // Для примера, просто уведомляем пользователя
      setInbox(prev => [...prev, `✨ Вы ответили про ${selectedFriend.first_name}`]);
      setScreen("result");
    }
  }

  async function buyVoices() {
    try {
      await bridge.send("VKWebAppShowOrderBox", {
        type: "item",
        item: "answers3"
      });
      alert("Покупка успешно завершена!"); // Уведомление об успешной покупке
    } catch (e) {
      console.error("Ошибка покупки:", e);
      alert("Произошла ошибка при попытке покупки."); // Уведомление об ошибке
    }
  }

  async function shareStory() {
    if (!appId) {
      console.error("ID приложения VK не установлен.");
      alert("Невозможно поделиться: ID приложения VK неизвестен.");
      return;
    }
    if (!user || !user.id) {
      console.error("ID пользователя VK не получен.");
      alert("Невозможно поделиться: информация о пользователе не загружена.");
      return;
    }
    try {
      await bridge.send("VKWebAppShowStoryBox", {
        background_type: "image",
        // Замените на реальную ссылку на вашу картинку для сторис
        url: "https://vk.com/images/icons/promo/camera_default.png", // Пример стандартной картинки
        attachment: {
          name: "open_app", // Системное имя для прикрепления
          // Используем appId, чтобы ссылка вела на приложение
          link: `https://vk.com/app${appId}`,
          // Можно добавить текст, если нужно
        }
      });
    } catch (e) {
      console.error("Ошибка отправки в сторис:", e);
      // Более детальная обработка ошибок VKWebAppShowStoryBox
      if (e.error_type === "client_api_method_failed") {
        alert("Ошибка: Не удалось показать сторис. Убедитесь, что приложение открыто в VK.");
      } else {
        alert("Произошла ошибка при попытке поделиться в сторис.");
      }
    }
  }

  // --- Рендеринг экранов ---

  // Экран загрузки
  if (screen === "loading") {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <h1 style={styles.title}>Загрузка...</h1>
        </div>
      </div>
    );
  }

  // Экран ошибки
  if (screen === "error") {
    return (
      <div style={styles.bg}>
        <div style={styles.container}>
          <h1 style={styles.title}>Ошибка</h1>
          <p style={styles.subtitle}>Не удалось загрузить приложение. Попробуйте позже.</p>
          <button style={styles.btn} onClick={() => window.location.reload()}>
            Обновить
          </button>
        </div>
      </div>
    );
  }

  // Экран отсутствия доступа к друзьям
  if (screen === "no_friends_access") {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Нет доступа к друзьям</h2>
          <p>Для работы приложения необходимо предоставить доступ к списку ваших друзей.</p>
          <button style={styles.btn} onClick={requestFriends}>
            Предоставить доступ
          </button>
          <button style={styles.btn} onClick={() => setScreen("menu")}>
            Назад
          </button>
        </div>
      </div>
    );
  }

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
            📲 Поделиться в сторис
          </button>
          <div style={styles.box}>
            <p>Пример сообщений</p>
            <div style={styles.msg}>❤️ Кто-то тайно влюблён в тебя</div>
            <div style={styles.msg}>🔥 Ты очень нравишься одному другу</div>
            <button style={styles.lock} onClick={buyVoices}>🔒 Узнать кто ответил — 3 голоса</button>
          </div>
        </div>
      </div>
    );
  }

  // Экран введения
  if (screen === "intro") {
    return (
      <div style={styles.bg}>
        <div style={styles.card}>
          <h2>Как это работает</h2>
          <p>Ты выбираешь друга и отвечаешь на вопросы. Ответы отправляются анонимно.</p>
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

  // Экран выбора друга
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
          {friendsError && (
            <div>
              <p>Не удалось загрузить список друзей.</p>
              <button style={styles.btn} onClick={requestFriends}>
                Повторить попытку
              </button>
            </div>
          )}
          {!friendsError && filteredFriends.map(f => (
            <div
              key={f.id}
              style={styles.friend}
              onClick={() => startQuiz(f)}
            >
              <img
                src={f.photo_100 || "https://vk.com/images/camera_200.png"}
                alt={f.first_name}
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
    );
  }

  // Экран викторины
  if (screen === "quiz" && selectedFriend) {
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
    );
  }

  // Экран результата
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
    );
  }

  // Экран входящих сообщений/ответов
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
    );
  }

  return null; // На всякий случай, если какой-то экран не определен
}

const styles = {
  bg: {
    minHeight: "100vh",
    background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, Arial",
    padding: "20px"
  },
  container: {
    width: "360px",
    textAlign: "center",
    color: "white"
  },
  title: {
    fontSize: "34px",
    fontWeight: "700",
    marginBottom: "8px",
    textShadow: "0 5px 20px rgba(0,0,0,0.25)"
  },
  subtitle: {
    opacity: 0.9,
    marginBottom: "25px",
    fontSize: "16px"
  },
  btn: {
    width: "100%",
    padding: "18px",
    marginTop: "14px",
    borderRadius: "50px",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    background: "linear-gradient(90deg,#ff7aa2,#ff4ecd,#7a5cff)",
    color: "white",
    fontWeight: "600",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
  },
  search: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    borderRadius: "14px",
    border: "none",
    fontSize: "15px"
  },
  box: {
    marginTop: "25px",
    background: "rgba(255,255,255,0.15)",
    padding: "18px",
    borderRadius: "22px",
    backdropFilter: "blur(15px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
  },
  msg: {
    background: "white",
    color: "#222",
    padding: "12px",
    borderRadius: "14px",
    marginTop: "10px",
    fontWeight: "500"
  },
  lock: {
    width: "100%",
    padding: "16px",
    marginTop: "14px",
    borderRadius: "40px",
    border: "none",
    background: "linear-gradient(90deg,#ff9a9e,#ff4ecd,#7a5cff)",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 8px 25px rgba(0,0,0,0.25)"
  },
  card: {
    width: "340px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(20px)",
    padding: "22px",
    borderRadius: "24px",
    color: "white",
    boxShadow: "0 8px 35px rgba(0,0,0,0.3)"
  },
  friend: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "white",
    color: "#111",
    borderRadius: "14px",
    marginTop: "8px",
    cursor: "pointer",
    fontWeight: "500"
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%"
  },
  answer: {
    width: "100%",
    padding: "16px",
    marginTop: "12px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(90deg,#ff8a9a,#ff3cac,#8b5cff)",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
  }
};

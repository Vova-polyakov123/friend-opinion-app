

javascript

Копировать



import React, { useState, useEffect } from "react";

import bridge from "@vkontakte/vk-bridge";

export default function App() {

  const [screen, setScreen] = useState("menu");

  const [user, setUser] = useState(null);

  const [friends, setFriends] = useState([]);

  const [search, setSearch] = useState("");

  const [friendsAccess, setFriendsAccess] = useState(null); // null = не запрашивали, true = разрешено, false = отказано

  const [selectedFriend, setSelectedFriend] = useState(null);

  const [qIndex, setQIndex] = useState(0);

  const [currentAnswers, setCurrentAnswers] = useState([]); // Ответы на текущий опрос

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

  // Эффект для инициализации VK Bridge и получения данных пользователя

  useEffect(() => {

    async function initApp() {

      await bridge.send("VKWebAppInit");

      try {

        const userInfo = await bridge.send("VKWebAppGetUserInfo");

        setUser(userInfo);

      } catch (e) {

        console.error("Ошибка VKWebAppGetUserInfo:", e);

      }

    }

    initApp();

  }, []);

  // Функция для запроса доступа к списку друзей

  async function requestFriendsAccess() {

    try {

      const friendsResponse = await bridge.send("VKWebAppGetFriends");

      const friendList = friendsResponse.items || [];

      setFriends(friendList);

      setFriendsAccess(true);

      setScreen("friends");

    } catch (error) {

      console.error("Ошибка VKWebAppGetFriends:", error);

      setFriendsAccess(false); // Отмечаем, что доступ не предоставлен

    }

  }

  // Фильтрация друзей по поисковому запросу

  const filteredFriends = friends.filter((friend) =>

    (friend.first_name + " " + (friend.last_name || ""))

      .toLowerCase()

      .includes(search.toLowerCase())

  );

  // Начало опроса для выбранного друга

  function startQuiz(friend) {

    setSelectedFriend(friend);

    setQIndex(0); // Сброс индекса вопроса

    setCurrentAnswers([]); // Очистка предыдущих ответов

    setScreen("quiz"); // Переход на экран опроса

  }

  // Обработка выбора ответа на вопрос

  function handleAnswerClick(answer) {

    const updatedAnswers = [...currentAnswers, answer];

    setCurrentAnswers(updatedAnswers);

    if (qIndex < questions.length - 1) {

      // Если есть следующий вопрос, переходим к нему

      setQIndex(qIndex + 1);

    } else {

      // Если это последний вопрос, сохраняем ответ и переходим к результату

      // В реальном приложении, здесь отправляем данные на сервер

      setInbox((prev) => [

        ...prev,

        {

          text: `💌 Кто-то ответил про ${selectedFriend.first_name}.`,

          locked: true, // Ответ по умолчанию заблокирован

          friendId: selectedFriend.id,

          answers: updatedAnswers,

        },

      ]);

      setScreen("result");

    }

  }

  // Функция для разблокировки ответов (покупка)

  async function buyAnswersUnlock() {

    try {

      await bridge.send("VKWebAppShowOrderBox", {

        type: "item",

        item: "answers_unlock", // Идентификатор товара

      });

      setPaid(true); // Отмечаем, что оплата прошла успешно

      // Разблокируем все ответы

      setInbox((prev) => prev.map((item) => ({ ...item, locked: false })));

    } catch (error) {

      console.error("Ошибка покупки:", error);

    }

  }

  // Функция для отправки сторис

  async function shareStory() {

    try {

      const appUrl = "https://vk.com/app54474085"; // Замените ID вашего приложения!

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "color", // Используем цветной фон

        color: "#7A3CFF", // Цвет фона

        attachment: {

          name: "link",

          url: appUrl,

          text_color: "#FFFFFF", // Цвет текста на кнопке

          caption: "Перейти в приложение", // Текст на кнопке

        },

      });

    } catch (error) {

      console.error("Ошибка VKWebAppShowStoryBox:", error);

      // Здесь можно предложить пользователю поделиться другим способом, если сторис не отправились

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

          <button style={styles.btn} onClick={requestFriendsAccess}>

            Продолжить

          </button>

          <button style={styles.btn} onClick={() => setScreen("menu")}>

            Назад

          </button>

        </div>

      </div>

    );

  }

  // Экран ожидания доступа к друзьям

  if (friendsAccess === null) {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Ожидание доступа...</h2>

          <p>Приложение запрашивает доступ к вашим друзьям.</p>

          <button style={styles.btn} onClick={requestFriendsAccess}>

            Повторить попытку

          </button>

          <button style={styles.btn} onClick={() => setScreen("menu")}>

            Назад

          </button>

        </div>

      </div>

    );

  }

  // Экран, если доступ к друзьям не предоставлен

  if (friendsAccess === false) {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Нужен доступ к друзьям</h2>

          <p>Без доступа нельзя выбрать друга для опроса.</p>

          <button style={styles.btn} onClick={requestFriendsAccess}>

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

          {filteredFriends.map((friend) => (

            <div

              key={friend.id}

              style={styles.friend}

              onClick={() => startQuiz(friend)} // Вызываем startQuiz при клике

            >

              <img src={friend.photo_100} style={styles.avatar} alt={friend.first_name} />

              {friend.first_name} {friend.last_name}

            </div>

          ))}

          <button style={styles.btn} onClick={() => setScreen("menu")}>

            Назад

          </button>

        </div>

      </div>

    );

  }

  // Экран самого опроса (появляется, только если selectedFriend существует)

  if (screen === "quiz" && selectedFriend) {

    const currentQuestion = questions[qIndex];

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>{selectedFriend.first_name}</h2>

          <p>{currentQuestion.q}</p>

          {currentQuestion.a.map((answer, i) => (

            <button

              key={i}

              style={styles.answer}

              onClick={() => handleAnswerClick(answer)}

            >

              {answer}

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

          {inbox.map((message, i) => (

            <div key={i} style={styles.msg}>

              {message.text}

              {message.locked && !paid && (

                <button style={styles.lock} onClick={buyAnswersUnlock}>

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

  // Если ни один экран не подошел (например, при первой загрузке до инициализации)

  return null;

}

// Стили для компонентов

const styles = {

  bg: { // Общий фон

    minHeight: "100vh",

    background: "linear-gradient(160deg,#6a3cff,#9b4dff,#ff6aa6)",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    fontFamily: "Inter",

    padding: "20px",

  },

  container: { // Контейнер для основного контента на главном экране

    width: "360px",

    textAlign: "center",

    color: "white",

  },

  title: { // Заголовок приложения

    fontSize: "34px",

    fontWeight: "700",

  },

  subtitle: { // Подзаголовок

    marginBottom: "20px",

  },

  btn: { // Стиль для кнопок

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

  card: { // Стиль для карточек (например, на экранах введения, опроса, результатов)

    width: "340px",

    background: "rgba(255,255,255,0.15)",

    backdropFilter: "blur(20px)",

    padding: "20px",

    borderRadius: "20px",

    color: "white",

  },

  search: { // Поле поиска друзей

    width: "100%",

    padding: "10px",

    borderRadius: "12px",

    border: "none",

    marginTop: "10px",

  },

  friend: { // Карточка друга в списке

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

  avatar: { // Аватар пользователя

    width: "40px",

    height: "40px",

    borderRadius: "50%",

  },

  answer: { // Стиль для кнопок ответов в опросе

    width: "100%",

    padding: "14px",

    marginTop: "10px",

    border: "none",

    borderRadius: "14px",

    background: "linear-gradient(90deg,#ff8a9a,#ff3cac,#8b5cff)",

    color: "white",

    cursor: "pointer",

  },

  msg: { // Стиль для сообщений во входящих

    background: "white",

    color: "#222",

    padding: "12px",

    borderRadius: "12px",

    marginTop: "10px",

  },

  lock: { // Стиль для кнопки "Разблокировать"

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


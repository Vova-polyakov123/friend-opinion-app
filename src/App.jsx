import React, { useState, useEffect } from "react";

import bridge from "@vkontakte/vk-bridge";

export default function App() {

  // Состояния для управления экранами приложения

  const [screen, setScreen] = useState("loading"); // Начальный экран "loading"

  const [user, setUser] = useState(null);

  const [friends, setFriends] = useState([]);

  const [search, setSearch] = useState("");

  const [friendsAccess, setFriendsAccess] = useState(null); // null - не запрашивали, true - есть доступ, false - нет доступа

  const [selectedFriend, setSelectedFriend] = useState(null);

  const [qIndex, setQIndex] = useState(0); // Текущий индекс вопроса

  const [currentAnswers, setCurrentAnswers] = useState([]); // Ответы для текущего опроса

  const [inbox, setInbox] = useState([]); // Входящие сообщения/ответы

  const [paid, setPaid] = useState(false); // Флаг оплаты

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

  // Инициализация приложения при монтировании компонента

  useEffect(() => {

    async function initApp() {

      try {

        // 1. Инициализация VK Bridge

        await bridge.send("VKWebAppInit");

        console.log("VKWebAppInit successful");

        // 2. Получение информации о пользователе

        const u = await bridge.send("VKWebAppGetUserInfo");

        setUser(u);

        console.log("VKWebAppGetUserInfo successful", u);

        // После успешной инициализации и получения пользователя, переходим к главному меню

        setScreen("menu");

      } catch (error) {

        console.error("Ошибка инициализации приложения:", error);

        // Если инициализация не удалась, отображаем экран ошибки

        setScreen("error");

      }

    }

    initApp();

  }, []); // Пустой массив зависимостей означает, что эффект выполнится один раз после монтирования

  // Функция запроса доступа к списку друзей

  async function requestFriendsAccess() {

    setScreen("loading"); // Показываем индикатор загрузки

    try {

      // Запрашиваем доступ к списку друзей

      const res = await bridge.send("VKWebAppGetFriends");

      const friendList = res.items || [];

      setFriends(friendList);

      setFriendsAccess(true); // Доступ предоставлен

      setScreen("friends"); // Переключаемся на экран списка друзей

      console.log("VKWebAppGetFriends successful", friendList);

    } catch (error) {

      console.error("Ошибка VKWebAppGetFriends:", error);

      setFriendsAccess(false); // Доступ не предоставлен (или произошла ошибка)

      // Проверяем, была ли это ошибка отказа в доступе

      if (error.error_type === "permission_denied") {

        setScreen("no_friends_access"); // Экран с сообщением о необходимости доступа

      } else {

        // Другая ошибка (например, проблема сети), показываем общий экран ошибки

        setScreen("error");

      }

    }

  }

  // Фильтрация списка друзей по поисковому запросу

  const filteredFriends = friends.filter(

    (friend) =>

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

      if (selectedFriend) { // Проверяем, выбран ли друг

        setInbox((prev) => [

          ...prev,

          {

            text: `💌 Кто-то ответил про ${selectedFriend.first_name}.`,

            locked: true, // Ответ по умолчанию заблокирован

            friendId: selectedFriend.id,

            answers: updatedAnswers, // Сохраняем собранные ответы

          },

        ]);

        setScreen("result"); // Переходим на экран результата

      } else {

        // Если selectedFriend по какой-то причине null, возвращаемся на главный экран

        console.error("Ошибка: selectedFriend не установлен при завершении опроса.");

        setScreen("menu");

      }

    }

  }

  // Функция для разблокировки ответов (покупка)

  async function buyAnswersUnlock() {

    try {

      await bridge.send("VKWebAppShowOrderBox", {

        type: "item",

        item: "answers_unlock", // Уникальный идентификатор товара для VK

      });

      setPaid(true); // Отмечаем, что оплата прошла успешно

      // Разблокируем все ответы во входящих

      setInbox((prev) => prev.map((item) => ({ ...item, locked: false })));

      console.log("Payment successful");

    } catch (error) {

      console.error("Ошибка при покупке:", error);

      // Здесь можно сообщить пользователю, что покупка не удалась

    }

  }

  // Функция для отправки сторис

  async function shareStory() {

    try {

      // Замените 'XXXX' на реальный ID вашего приложения VK

      // Для локальной разработки можно использовать временный URL, но для продакшена нужен реальный.

      const appUrl = "https://vk.com/app54474085"; // Пример: https://vk.com/app<YOUR_APP_ID>

      await bridge.send("VKWebAppShowStoryBox", {

        background_type: "color", // Тип фона для сторис (можно "image" для картинки)

        color: "#7A3CFF",        // Цвет фона, если background_type "color"

        attachment: {

          name: "link",          // Тип вложения - ссылка

          url: appUrl,           // URL, на который ведет ссылка

          text_color: "#FFFFFF", // Цвет текста на кнопке/превью

          caption: "Перейти в приложение", // Текст на кнопке/превью

        },

      });

      console.log("Story share initiated");

    } catch (error) {

      console.error("Ошибка при отправке сторис:", error);

      // Здесь можно показать уведомление пользователю об ошибке,

      // например, "Не удалось отправить сторис. Попробуйте позже."

    }

  }

  // --- Рендеринг экранов ---

  // Экран загрузки

  if (screen === "loading") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>Загрузка...</h1>

          <p style={styles.subtitle}>Инициализация приложения...</p>

        </div>

      </div>

    );

  }

  // Экран общей ошибки

  if (screen === "error") {

    return (

      <div style={styles.bg}>

        <div style={styles.container}>

          <h1 style={styles.title}>Ошибка загрузки</h1>

          <p style={styles.subtitle}>Проверьте подключение к сети или попробуйте позже.</p>

          <button style={styles.btn} onClick={() => window.location.reload()}>

            Повторить попытку

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

          {/* Кнопка вызывает запрос доступа к друзьям */}

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

  // Экран, если доступ к друзьям не предоставлен

  if (screen === "no_friends_access") {

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>Нужен доступ к друзьям</h2>

          <p>Без доступа к списку друзей невозможно выбрать, кого опрашивать.</p>

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

              onClick={() => startQuiz(friend)} // Вызываем startQuiz при клике на друга

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

    const currentQuestion = questions[qIndex]; // Получаем текущий вопрос

    return (

      <div style={styles.bg}>

        <div style={styles.card}>

          <h2>{selectedFriend.first_name}</h2>

          <p>{currentQuestion.q}</p> {/* Текст вопроса */}

          {currentQuestion.a.map((answer, i) => (

            <button

              key={i}

              style={styles.answer}

              onClick={() => handleAnswerClick(answer)} // Обработка нажатия на ответ

            >

              {answer} {/* Текст ответа */}

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

              {/* Кнопка разблокировки видна, только если ответ заблокирован и оплата не пройшла */}

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

  // Если ни один из вышеперечисленных экранов не подошел, возвращаем null

  // Это может произойти, например, во время первой загрузки, пока screen еще "loading".

  return null;

}

// Стили для компонентов (оставлены без изменений)

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

    boxSizing: "border-box", // Чтобы padding не увеличивал ширину

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

    transition: "background-color 0.2s ease", // Плавный переход при наведении

  },

  friendHover: { // Стиль при наведении (можно добавить в JS, но для простоты оставим так)

    background: "#e0e0e0",

  },

  avatar: { // Аватар пользователя

    width: "40px",

    height: "40px",

    borderRadius: "50%",

    objectFit: "cover", // Обеспечивает правильное отображение картинки

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

    fontSize: "16px",

    fontWeight: "600",

    transition: "transform 0.2s ease", // Плавный эффект нажатия

  },

  answerHover: { // Стиль при нажатии (можно добавить в JS)

    transform: "scale(1.02)",

  },

  msg: { // Стиль для сообщений во входящих

    background: "white",

    color: "#222",

    padding: "12px",

    borderRadius: "12px",

    marginTop: "10px",

    position: "relative", // Для позиционирования кнопки внутри

  },

  lock: { // Стиль для кнопки "Разблокировать"

    width: "calc(100% - 20px)", // чтобы кнопка не вылезала за padding

    padding: "12px",

    marginTop: "10px",

    border: "none",

    borderRadius: "30px",

    background: "#ff4ecd",

    color: "white",

    cursor: "pointer",

    fontSize: "16px",

    fontWeight: "600",

    position: "absolute", // Позиционируем внутри msg

    bottom: "10px", // Размещаем внизу блока сообщения

    left: "10px",

  },

};


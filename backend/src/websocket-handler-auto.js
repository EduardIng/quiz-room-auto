/**
 * websocket-handler-auto.js - Обробник всіх WebSocket подій
 *
 * Відповідає за:
 * - Прийом подій від клієнтів (host та players)
 * - Маршрутизацію до правильної сесії
 * - Управління кімнатами (створення, видалення)
 * - Обробку відключень
 *
 * Клас QuizRoomManager зберігає всі активні сесії та обробляє
 * Socket.IO події для кожного підключеного клієнта.
 */

const AutoQuizSession = require('./quiz-session-auto');
const { log } = require('./utils');
const db = require('./db');

class QuizRoomManager {
  /**
   * Створює менеджер кімнат
   *
   * @param {Object} io - Ініціалізований Socket.IO сервер
   * @param {Object} config - Глобальна конфігурація (config.json)
   */
  constructor(io, config) {
    this.io = io;

    // Глобальна конфігурація (таймери, ліміти)
    this.config = config;

    // Map активних сесій: roomCode → AutoQuizSession
    // Кожна кімната має унікальний 6-символьний код
    this.sessions = new Map();

    // Map приналежності сокетів: socketId → roomCode
    // Потрібно щоб при відключенні знати з якої кімнати видалити гравця
    this.socketToRoom = new Map();
  }

  /**
   * Ініціалізує обробники подій для Socket.IO
   *
   * Викликається один раз при старті сервера.
   * Реєструє обробник для кожного нового підключення.
   *
   * Побічні ефекти:
   * - Реєструє слухача 'connection' на io
   */
  init() {
    // Обробляємо кожне нове підключення
    this.io.on('connection', (socket) => {
      log('WS', `Нове підключення: ${socket.id}`);

      // Реєструємо всі обробники подій для цього сокету
      socket.on('create-quiz', (data, callback) => this.handleCreateQuiz(socket, data, callback));
      socket.on('join-quiz', (data, callback) => this.handleJoinQuiz(socket, data, callback));
      socket.on('submit-answer', (data, callback) => this.handleSubmitAnswer(socket, data, callback));
      socket.on('get-game-state', (data, callback) => this.handleGetGameState(socket, data, callback));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });

    // Запускаємо очищення старих сесій кожні 30 хвилин
    setInterval(() => this.cleanupOldSessions(), 30 * 60 * 1000);

    log('WS', 'WebSocket менеджер ініціалізовано');
  }

  // ─────────────────────────────────────────────
  // ОБРОБНИКИ ПОДІЙ
  // ─────────────────────────────────────────────

  /**
   * Обробляє створення нової квіз-кімнати (хостом)
   *
   * Подія: 'create-quiz'
   * Відправник: Host (адміністратор квізу)
   *
   * Що робить:
   * 1. Валідує вхідні дані квізу
   * 2. Генерує унікальний код кімнати
   * 3. Створює новий AutoQuizSession
   * 4. Реєструє хост-сокет в кімнаті
   * 5. Повертає код кімнати хосту
   *
   * @param {Object} socket - Socket.IO сокет хоста
   * @param {Object} data - { quizData, settings }
   * @param {Function} callback - Функція відповіді { success, roomCode } або { success, error }
   */
  handleCreateQuiz(socket, data, callback) {
    // Безпечна перевірка що callback - функція
    const respond = typeof callback === 'function' ? callback : () => {};

    try {
      // Валідація вхідних даних
      if (!data || !data.quizData) {
        return respond({ success: false, error: 'Відсутні дані квізу' });
      }

      if (!data.quizData.questions || !Array.isArray(data.quizData.questions)) {
        return respond({ success: false, error: 'Квіз повинен мати масив питань' });
      }

      if (data.quizData.questions.length === 0) {
        return respond({ success: false, error: 'Квіз повинен мати хоча б одне питання' });
      }

      // Перевіряємо кожне питання
      for (let i = 0; i < data.quizData.questions.length; i++) {
        const q = data.quizData.questions[i];
        if (!q.question || !q.answers || q.answers.length !== 4) {
          return respond({ success: false, error: `Питання ${i + 1} має неправильний формат (потрібно 4 варіанти відповіді)` });
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          return respond({ success: false, error: `Питання ${i + 1}: correctAnswer має бути числом 0-3` });
        }
      }

      // Генеруємо унікальний код кімнати
      const roomCode = this.generateRoomCode();

      // Об'єднуємо налаштування від хоста з глобальними дефолтами
      const settings = {
        questionTime: this.config.quiz.questionTime,
        answerRevealTime: this.config.quiz.answerRevealTime,
        leaderboardTime: this.config.quiz.leaderboardTime,
        autoStart: this.config.quiz.autoStart,
        waitForAllPlayers: this.config.quiz.waitForAllPlayers,
        minPlayers: this.config.quiz.minPlayers,
        maxPlayers: this.config.quiz.maxPlayers,
        // Налаштування від хоста перезаписують дефолти (якщо надані)
        ...(data.settings || {})
      };

      // Створюємо новий сеанс
      const session = new AutoQuizSession(data.quizData, settings, db);
      session.init(this.io, roomCode);

      // Зберігаємо сеанс
      this.sessions.set(roomCode, session);

      // Підключаємо хоста до Socket.IO кімнати
      socket.join(roomCode);
      this.socketToRoom.set(socket.id, roomCode);

      log('WS', `Квіз створено. Кімната: ${roomCode}, Питань: ${data.quizData.questions.length}`);

      // Відповідаємо хосту з кодом кімнати
      respond({ success: true, roomCode });

    } catch (err) {
      log('WS', `Помилка при створенні квізу: ${err.message}`);
      respond({ success: false, error: 'Внутрішня помилка сервера' });
    }
  }

  /**
   * Обробляє приєднання гравця до кімнати
   *
   * Подія: 'join-quiz'
   * Відправник: Player (гравець зі своїм телефоном/планшетом)
   *
   * Що робить:
   * 1. Валідує roomCode та nickname
   * 2. Знаходить сесію за кодом кімнати
   * 3. Додає гравця до сесії через session.addPlayer()
   * 4. Підключає сокет до Socket.IO кімнати
   * 5. Повертає поточний стан гри
   *
   * @param {Object} socket - Socket.IO сокет гравця
   * @param {Object} data - { roomCode, nickname }
   * @param {Function} callback - Функція відповіді
   */
  handleJoinQuiz(socket, data, callback) {
    const respond = typeof callback === 'function' ? callback : () => {};

    try {
      // Валідація roomCode
      if (!data || !data.roomCode) {
        return respond({ success: false, error: 'Вкажіть код кімнати' });
      }

      const roomCode = String(data.roomCode).toUpperCase().trim();

      if (roomCode.length !== 6) {
        return respond({ success: false, error: 'Код кімнати має бути 6 символів' });
      }

      // Валідація nickname
      if (!data.nickname) {
        return respond({ success: false, error: 'Вкажіть нікнейм' });
      }

      const nickname = String(data.nickname).trim();

      if (nickname.length < 2 || nickname.length > 20) {
        return respond({ success: false, error: 'Нікнейм має бути від 2 до 20 символів' });
      }

      // Знаходимо сесію
      const session = this.sessions.get(roomCode);

      if (!session) {
        return respond({ success: false, error: `Кімната "${roomCode}" не знайдена. Перевірте код.` });
      }

      // Додаємо гравця до сесії
      const result = session.addPlayer(socket.id, nickname);

      if (!result.success) {
        return respond({ success: false, error: result.error });
      }

      // Підключаємо сокет до Socket.IO кімнати (для broadcast)
      socket.join(roomCode);
      this.socketToRoom.set(socket.id, roomCode);

      log('WS', `Гравець "${nickname}" (${socket.id}) приєднався до кімнати ${roomCode}`);

      // Повертаємо гравцю поточний стан гри
      respond({
        success: true,
        message: `Ласкаво просимо до квізу "${session.quizData.title}"!`,
        nickname,
        roomCode,
        gameState: session.getState()
      });

    } catch (err) {
      log('WS', `Помилка при приєднанні до квізу: ${err.message}`);
      respond({ success: false, error: 'Внутрішня помилка сервера' });
    }
  }

  /**
   * Обробляє відповідь гравця на питання
   *
   * Подія: 'submit-answer'
   * Відправник: Player
   *
   * Що робить:
   * 1. Знаходить сесію гравця
   * 2. Передає відповідь в session.submitAnswer()
   * 3. Повертає результат (success/error)
   *
   * @param {Object} socket - Socket.IO сокет гравця
   * @param {Object} data - { answerId }
   * @param {Function} callback - Функція відповіді
   */
  handleSubmitAnswer(socket, data, callback) {
    const respond = typeof callback === 'function' ? callback : () => {};

    try {
      // Знаходимо кімнату гравця
      const roomCode = this.socketToRoom.get(socket.id);

      if (!roomCode) {
        return respond({ success: false, error: 'Ви не знаходитесь в жодній кімнаті' });
      }

      const session = this.sessions.get(roomCode);

      if (!session) {
        return respond({ success: false, error: 'Сесія не знайдена' });
      }

      // Валідація answerId
      if (data === undefined || data === null || data.answerId === undefined) {
        return respond({ success: false, error: 'Вкажіть відповідь' });
      }

      const answerId = Number(data.answerId);

      if (isNaN(answerId) || answerId < 0 || answerId > 3) {
        return respond({ success: false, error: 'Відповідь має бути числом 0-3' });
      }

      // Передаємо відповідь до сесії з поточним часом сервера
      const result = session.submitAnswer(socket.id, answerId, Date.now());

      respond(result);

    } catch (err) {
      log('WS', `Помилка при обробці відповіді: ${err.message}`);
      respond({ success: false, error: 'Внутрішня помилка сервера' });
    }
  }

  /**
   * Обробляє запит поточного стану гри
   *
   * Подія: 'get-game-state'
   * Відправник: Player або Host (при reconnect)
   *
   * Повертає поточний стан сесії для синхронізації після перезавантаження
   *
   * @param {Object} socket - Socket.IO сокет клієнта
   * @param {Object} data - { roomCode }
   * @param {Function} callback - Функція відповіді
   */
  handleGetGameState(socket, data, callback) {
    const respond = typeof callback === 'function' ? callback : () => {};

    try {
      const roomCode = data?.roomCode || this.socketToRoom.get(socket.id);

      if (!roomCode) {
        return respond({ success: false, error: 'Вкажіть код кімнати' });
      }

      const session = this.sessions.get(roomCode.toUpperCase());

      if (!session) {
        return respond({ success: false, error: 'Сесія не знайдена' });
      }

      respond({ success: true, gameState: session.getState() });

    } catch (err) {
      log('WS', `Помилка при отриманні стану: ${err.message}`);
      respond({ success: false, error: 'Внутрішня помилка сервера' });
    }
  }

  /**
   * Обробляє відключення клієнта
   *
   * Подія: 'disconnect' (автоматично від Socket.IO)
   * Відправник: Будь-який клієнт (host або player)
   *
   * Що робить:
   * 1. Знаходить кімнату за socketId
   * 2. Видаляє гравця зі сесії через session.removePlayer()
   * 3. Очищає відображення socketId → roomCode
   * 4. Якщо сесія завершена і гравців немає → видаляє сесію
   *
   * @param {Object} socket - Socket.IO сокет що відключається
   */
  handleDisconnect(socket) {
    log('WS', `Відключення: ${socket.id}`);

    // Знаходимо кімнату цього сокету
    const roomCode = this.socketToRoom.get(socket.id);

    if (roomCode) {
      const session = this.sessions.get(roomCode);

      if (session) {
        // Видаляємо гравця з сесії
        session.removePlayer(socket.id);

        // Якщо квіз завершено і гравців не залишилось → видаляємо сесію
        if (session.gameState === 'ENDED' && session.players.size === 0) {
          this.sessions.delete(roomCode);
          log('WS', `Сесія ${roomCode} видалена (завершена, гравців немає)`);
        }
      }

      // Видаляємо відображення сокет → кімната
      this.socketToRoom.delete(socket.id);
    }
  }

  // ─────────────────────────────────────────────
  // ДОПОМІЖНІ МЕТОДИ
  // ─────────────────────────────────────────────

  /**
   * Генерує унікальний 6-символьний код кімнати
   *
   * Формат: тільки великі літери та цифри (A-Z, 0-9)
   * Виключено схожі символи: I, O, 0, 1 (щоб уникнути плутанини)
   * Гарантовано унікальність серед активних сесій
   *
   * @returns {string} Унікальний 6-символьний код
   */
  generateRoomCode() {
    // Безпечні символи (без I, O, 0, 1 - легко переплутати)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    let attempts = 0;

    do {
      // Генеруємо 6 випадкових символів
      code = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');
      attempts++;

      // Захист від нескінченного циклу (практично неможливо, але все ж)
      if (attempts > 1000) {
        code = code + Date.now().toString(36).toUpperCase().slice(-2);
        break;
      }
    } while (this.sessions.has(code)); // Повторюємо поки код унікальний

    return code;
  }

  /**
   * Видаляє старі та завершені сесії для звільнення пам'яті
   *
   * Запускається автоматично кожні 30 хвилин.
   * Видаляє сесії що:
   * - Перебувають в стані ENDED
   * - Або старіші 24 годин (захист від "зависших" сесій)
   */
  cleanupOldSessions() {
    const now = Date.now();
    let removedCount = 0;

    for (const [roomCode, session] of this.sessions.entries()) {
      // Видаляємо завершені сесії без гравців
      if (session.gameState === 'ENDED' && session.players.size === 0) {
        this.sessions.delete(roomCode);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      log('WS', `Очищення: видалено ${removedCount} старих сесій. Активних: ${this.sessions.size}`);
    }
  }

  /**
   * Повертає список активних квіз-кімнат (для API ендпоінту)
   *
   * @returns {Array} Масив { roomCode, title, playerCount, gameState }
   */
  getActiveSessions() {
    return Array.from(this.sessions.entries()).map(([roomCode, session]) => ({
      roomCode,
      title: session.quizData.title,
      playerCount: session.players.size,
      gameState: session.gameState
    }));
  }
}

module.exports = QuizRoomManager;

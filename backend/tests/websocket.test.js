/**
 * websocket.test.js - Тести для QuizRoomManager
 *
 * Покриває:
 * - Генерацію кодів кімнат
 * - Створення квіз-кімнат (handleCreateQuiz)
 * - Приєднання гравців (handleJoinQuiz)
 * - Обробку відповідей (handleSubmitAnswer)
 * - Обробку відключень (handleDisconnect)
 * - Очищення старих сесій (cleanupOldSessions)
 * - Валідацію вхідних даних
 */

'use strict';

const QuizRoomManager = require('../src/websocket-handler-auto');

// ─────────────────────────────────────────────
// ТЕСТОВІ ДАНІ
// ─────────────────────────────────────────────

const QUIZ_DATA = {
  title: 'WS Тестовий квіз',
  questions: [
    {
      question: 'Тестове питання 1?',
      answers: ['A', 'B', 'C', 'D'],
      correctAnswer: 0
    },
    {
      question: 'Тестове питання 2?',
      answers: ['W', 'X', 'Y', 'Z'],
      correctAnswer: 2
    }
  ]
};

const DEFAULT_CONFIG = {
  quiz: {
    questionTime: 30,
    answerRevealTime: 2,
    leaderboardTime: 2,
    autoStart: false,
    waitForAllPlayers: true,
    minPlayers: 1,
    maxPlayers: 8
  }
};

// ─────────────────────────────────────────────
// ХЕЛПЕРИ
// ─────────────────────────────────────────────

/**
 * Створює мок Socket.IO сервер та мок сокет для тестів
 */
function createMocks() {
  const roomEmits = [];

  // Мок io (сервер)
  const mockIo = {
    on: jest.fn(),
    to: (room) => ({
      emit: (event, data) => roomEmits.push({ room, event, data })
    })
  };

  // Фабрика мок-сокетів (для кожного підключення)
  function createSocket(id = 'socket-test') {
    const joinedRooms = [];
    return {
      id,
      join: jest.fn((room) => joinedRooms.push(room)),
      joinedRooms,
      emit: jest.fn()
    };
  }

  return { mockIo, roomEmits, createSocket };
}

/**
 * Створює QuizRoomManager та виконує create-quiz через handleCreateQuiz
 * Повертає { manager, roomCode, socket }
 */
function setupRoomWithQuiz(config = DEFAULT_CONFIG) {
  const { mockIo, roomEmits, createSocket } = createMocks();
  const manager = new QuizRoomManager(mockIo, config);

  const hostSocket = createSocket('host-socket');
  let roomCode = null;

  manager.handleCreateQuiz(hostSocket, { quizData: QUIZ_DATA }, (resp) => {
    roomCode = resp.roomCode;
  });

  return { manager, roomCode, hostSocket, mockIo, roomEmits, createSocket };
}

/**
 * Очищає таймери всіх активних сесій
 */
function clearAllTimers(manager) {
  for (const session of manager.sessions.values()) {
    clearTimeout(session.questionTimer);
    clearTimeout(session.transitionTimer);
  }
}

// ─────────────────────────────────────────────
// ТЕСТИ: Генерація кодів кімнат
// ─────────────────────────────────────────────

describe('QuizRoomManager — generateRoomCode', () => {
  test('генерує 6-символьний код', () => {
    const manager = new QuizRoomManager({}, DEFAULT_CONFIG);
    const code = manager.generateRoomCode();
    expect(code).toHaveLength(6);
  });

  test('код містить тільки допустимі символи (A-Z, 2-9, без I/O/0/1)', () => {
    const manager = new QuizRoomManager({}, DEFAULT_CONFIG);
    const forbidden = /[IO01]/;

    for (let i = 0; i < 50; i++) {
      const code = manager.generateRoomCode();
      expect(code).toMatch(/^[A-Z2-9]{6}$/);
      expect(code).not.toMatch(forbidden);
    }
  });

  test('генерує унікальні коди', () => {
    const manager = new QuizRoomManager({}, DEFAULT_CONFIG);
    const codes = new Set();

    for (let i = 0; i < 100; i++) {
      codes.add(manager.generateRoomCode());
    }

    // З 100 згенерованих кодів дублікати вкрай малоймовірні
    expect(codes.size).toBeGreaterThanOrEqual(99);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: handleCreateQuiz
// ─────────────────────────────────────────────

describe('QuizRoomManager — handleCreateQuiz', () => {
  test('успішно створює кімнату та повертає roomCode', () => {
    const { manager, roomCode } = setupRoomWithQuiz();

    expect(roomCode).toBeDefined();
    expect(roomCode).toHaveLength(6);
    expect(manager.sessions.has(roomCode)).toBe(true);
  });

  test('хост-сокет реєструється в кімнаті', () => {
    const { hostSocket, roomCode } = setupRoomWithQuiz();

    expect(hostSocket.join).toHaveBeenCalledWith(roomCode);
  });

  test('відхиляє запит без quizData', () => {
    const { mockIo } = createMocks();
    const manager = new QuizRoomManager(mockIo, DEFAULT_CONFIG);
    const socket = { id: 's1', join: jest.fn() };
    let response;

    manager.handleCreateQuiz(socket, {}, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toBeTruthy();
  });

  test('відхиляє квіз без питань', () => {
    const { mockIo } = createMocks();
    const manager = new QuizRoomManager(mockIo, DEFAULT_CONFIG);
    const socket = { id: 's1', join: jest.fn() };
    let response;

    manager.handleCreateQuiz(socket, { quizData: { title: 'Empty', questions: [] } }, (r) => { response = r; });

    expect(response.success).toBe(false);
  });

  test('відхиляє питання з неправильним форматом (не 4 відповіді)', () => {
    const { mockIo } = createMocks();
    const manager = new QuizRoomManager(mockIo, DEFAULT_CONFIG);
    const socket = { id: 's1', join: jest.fn() };
    let response;

    const badQuiz = {
      title: 'Bad quiz',
      questions: [{ question: 'Q?', answers: ['A', 'B'], correctAnswer: 0 }]
    };

    manager.handleCreateQuiz(socket, { quizData: badQuiz }, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/формат/i);
  });

  test('відхиляє невалідний correctAnswer', () => {
    const { mockIo } = createMocks();
    const manager = new QuizRoomManager(mockIo, DEFAULT_CONFIG);
    const socket = { id: 's1', join: jest.fn() };
    let response;

    const badQuiz = {
      title: 'Bad quiz',
      questions: [{ question: 'Q?', answers: ['A', 'B', 'C', 'D'], correctAnswer: 5 }]
    };

    manager.handleCreateQuiz(socket, { quizData: badQuiz }, (r) => { response = r; });

    expect(response.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: handleJoinQuiz
// ─────────────────────────────────────────────

describe('QuizRoomManager — handleJoinQuiz', () => {
  test('успішно приєднує гравця до існуючої кімнати', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, (r) => { response = r; });

    expect(response.success).toBe(true);
    expect(response.nickname).toBe('Петро');
    expect(response.roomCode).toBe(roomCode);
    expect(response.gameState).toBeDefined();
  });

  test('сокет гравця реєструється в кімнаті', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Марія' }, () => {});

    expect(playerSocket.join).toHaveBeenCalledWith(roomCode);
    expect(manager.socketToRoom.get('player-1')).toBe(roomCode);
  });

  test('відхиляє неіснуючий код кімнати', () => {
    const { manager, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    manager.handleJoinQuiz(playerSocket, { roomCode: 'XXXXXX', nickname: 'Петро' }, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/не знайдена/i);
  });

  test('відхиляє нікнейм коротший 2 символів', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'А' }, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/символів/i);
  });

  test('відхиляє нікнейм довший 20 символів', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    manager.handleJoinQuiz(playerSocket, {
      roomCode,
      nickname: 'ДужеДовгийНікнеймЩоПеревищує20Символів'
    }, (r) => { response = r; });

    expect(response.success).toBe(false);
  });

  test('відхиляє код кімнати не 6 символів', () => {
    const { manager, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    manager.handleJoinQuiz(playerSocket, { roomCode: 'ABC', nickname: 'Петро' }, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/6 символів/i);
  });

  test('код кімнати автоматично переводиться у верхній регістр', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    // Передаємо у нижньому регістрі
    manager.handleJoinQuiz(playerSocket, {
      roomCode: roomCode.toLowerCase(),
      nickname: 'Петро'
    }, (r) => { response = r; });

    expect(response.success).toBe(true);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: handleSubmitAnswer
// ─────────────────────────────────────────────

describe('QuizRoomManager — handleSubmitAnswer', () => {
  test('успішно приймає відповідь від зареєстрованого гравця', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    // Симулюємо стан QUESTION
    const session = manager.sessions.get(roomCode);
    session.gameState = 'QUESTION';
    session.currentQuestionIndex = 0;
    session.questionStartTime = Date.now() - 5000;

    let response;
    manager.handleSubmitAnswer(playerSocket, { answerId: 0 }, (r) => { response = r; });
    clearAllTimers(manager);

    expect(response.success).toBe(true);
  });

  test('відхиляє відповідь від гравця не в кімнаті', () => {
    const { manager, createSocket } = setupRoomWithQuiz();
    const unknownSocket = createSocket('unknown');
    let response;

    manager.handleSubmitAnswer(unknownSocket, { answerId: 0 }, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/не знаходитесь/i);
  });

  test('відхиляє answerId < 0', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    const session = manager.sessions.get(roomCode);
    session.gameState = 'QUESTION';
    session.currentQuestionIndex = 0;
    session.questionStartTime = Date.now();

    let response;
    manager.handleSubmitAnswer(playerSocket, { answerId: -1 }, (r) => { response = r; });

    expect(response.success).toBe(false);
    expect(response.error).toMatch(/0-3/i);
  });

  test('відхиляє answerId > 3', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    const session = manager.sessions.get(roomCode);
    session.gameState = 'QUESTION';
    session.currentQuestionIndex = 0;
    session.questionStartTime = Date.now();

    let response;
    manager.handleSubmitAnswer(playerSocket, { answerId: 4 }, (r) => { response = r; });

    expect(response.success).toBe(false);
  });

  test('відхиляє відсутній answerId', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    let response;
    manager.handleSubmitAnswer(playerSocket, {}, (r) => { response = r; });

    expect(response.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: handleDisconnect
// ─────────────────────────────────────────────

describe('QuizRoomManager — handleDisconnect', () => {
  test('видаляє гравця зі сесії при відключенні', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    expect(manager.sessions.get(roomCode).players.size).toBe(1);

    manager.handleDisconnect(playerSocket);

    expect(manager.sessions.get(roomCode).players.size).toBe(0);
    expect(manager.socketToRoom.has('player-1')).toBe(false);
  });

  test('не кидає помилку при відключенні невідомого сокету', () => {
    const { manager, createSocket } = setupRoomWithQuiz();
    const unknownSocket = createSocket('unknown');

    expect(() => manager.handleDisconnect(unknownSocket)).not.toThrow();
  });

  test('видаляє завершену сесію без гравців', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    // Симулюємо завершену гру
    manager.sessions.get(roomCode).gameState = 'ENDED';
    manager.handleDisconnect(playerSocket);

    // Сесія має бути видалена
    expect(manager.sessions.has(roomCode)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: handleGetGameState
// ─────────────────────────────────────────────

describe('QuizRoomManager — handleGetGameState', () => {
  test('повертає стан гри за кодом кімнати', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');

    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    let response;
    manager.handleGetGameState(playerSocket, { roomCode }, (r) => { response = r; });

    expect(response.success).toBe(true);
    expect(response.gameState).toBeDefined();
    expect(response.gameState.gameState).toBe('WAITING');
  });

  test('повертає помилку для неіснуючої кімнати', () => {
    const { manager, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    let response;

    manager.handleGetGameState(playerSocket, { roomCode: 'XXXXXX' }, (r) => { response = r; });

    expect(response.success).toBe(false);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: cleanupOldSessions
// ─────────────────────────────────────────────

describe('QuizRoomManager — cleanupOldSessions', () => {
  test('видаляє завершені сесії без гравців', () => {
    const { manager, roomCode } = setupRoomWithQuiz();

    // Симулюємо завершену сесію без гравців
    manager.sessions.get(roomCode).gameState = 'ENDED';
    // Гравців вже немає (нікого не приєднували)

    manager.cleanupOldSessions();

    expect(manager.sessions.has(roomCode)).toBe(false);
  });

  test('зберігає активні сесії', () => {
    const { manager, roomCode, createSocket } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    manager.cleanupOldSessions();

    // Сесія активна (є гравець і стан не ENDED) — не видаляти
    expect(manager.sessions.has(roomCode)).toBe(true);
  });
});

// ─────────────────────────────────────────────
// ТЕСТИ: getActiveSessions
// ─────────────────────────────────────────────

describe('QuizRoomManager — getActiveSessions', () => {
  test('повертає список активних сесій', () => {
    const { manager, createSocket, roomCode } = setupRoomWithQuiz();
    const playerSocket = createSocket('player-1');
    manager.handleJoinQuiz(playerSocket, { roomCode, nickname: 'Петро' }, () => {});

    const sessions = manager.getActiveSessions();

    expect(sessions).toHaveLength(1);
    expect(sessions[0].roomCode).toBe(roomCode);
    expect(sessions[0].title).toBe('WS Тестовий квіз');
    expect(sessions[0].playerCount).toBe(1);
    expect(sessions[0].gameState).toBe('WAITING');
  });

  test('повертає порожній масив якщо немає сесій', () => {
    const { mockIo } = createMocks();
    const manager = new QuizRoomManager(mockIo, DEFAULT_CONFIG);

    expect(manager.getActiveSessions()).toEqual([]);
  });
});

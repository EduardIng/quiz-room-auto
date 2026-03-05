/**
 * server.js - Головний сервер Quiz Room Auto
 *
 * Відповідає за:
 * - Ініціалізацію Express (HTTP сервер)
 * - Ініціалізацію Socket.IO (WebSocket сервер)
 * - Налаштування middleware (CORS, JSON, статичні файли)
 * - HTTP маршрути (API ендпоінти)
 * - Запуск та graceful shutdown
 *
 * Запуск:
 *   node backend/src/server.js
 *   або: npm start
 */

const http = require('http');
const path = require('path');
const os = require('os');
const express = require('express');
const { Server: SocketIOServer } = require('socket.io');
const cors = require('cors');
const { loadConfig, log } = require('./utils');
const QuizRoomManager = require('./websocket-handler-auto');

class QuizServer {
  /**
   * Ініціалізує сервер
   * Завантажує конфігурацію та готує все до запуску
   */
  constructor() {
    // Завантажуємо конфігурацію з config.json (або defaults)
    this.config = loadConfig();

    // Ініціалізуємо Express
    this.app = express();

    // Створюємо HTTP сервер на основі Express
    // Socket.IO потребує сирий HTTP сервер (не Express напряму)
    this.httpServer = http.createServer(this.app);

    // Ініціалізуємо Socket.IO на HTTP сервері
    this.io = new SocketIOServer(this.httpServer, {
      // CORS для дозволу підключень з планшетів/телефонів в мережі
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Ініціалізуємо менеджер WebSocket кімнат
    this.roomManager = new QuizRoomManager(this.io, this.config);

    // Прапорець що сервер запущений
    this.isRunning = false;
  }

  /**
   * Налаштовує всі Express middleware
   *
   * Додає:
   * - Body parser для JSON (читання request body)
   * - CORS для доступу з інших пристроїв в мережі
   * - Static files для фронтенду
   * - Request logging
   *
   * Викликається один раз при старті сервера
   */
  setupMiddleware() {
    // Body parser - дозволяє читати JSON з request body
    this.app.use(express.json());

    // CORS - дозволяє планшетам і телефонам підключатись з інших IP в мережі
    this.app.use(cors());

    // Логування кожного HTTP запиту (для дебагу)
    this.app.use((req, res, next) => {
      log('HTTP', `${req.method} ${req.path}`);
      next();
    });

    // Статичні файли фронтенду
    // Спочатку шукаємо в build/ (production), потім в public/
    const buildPath = path.join(__dirname, '..', '..', 'frontend', 'build');
    const publicPath = path.join(__dirname, '..', '..', 'frontend', 'public');

    this.app.use(express.static(buildPath));
    this.app.use(express.static(publicPath));
  }

  /**
   * Налаштовує HTTP маршрути (REST API ендпоінти)
   *
   * Маршрути:
   * - GET /health - перевірка стану сервера
   * - GET /api/active-quizzes - список активних квіз-кімнат
   * - GET /* - відправляємо index.html для SPA фронтенду
   *
   * Викликається після setupMiddleware()
   */
  setupRoutes() {
    // Health check - перевірка чи сервер живий
    // Корисно для моніторингу та automated tests
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        uptime: Math.floor(process.uptime()),
        activeSessions: this.roomManager.sessions.size,
        timestamp: new Date().toISOString()
      });
    });

    // API: список активних квіз-кімнат
    // Використовується адмін-панеллю для відображення активних ігор
    this.app.get('/api/active-quizzes', (req, res) => {
      const sessions = this.roomManager.getActiveSessions();
      res.json({ success: true, sessions });
    });

    // Catch-all маршрут для SPA (Single Page Application)
    // Всі інші GET запити відправляємо index.html (React Router handles the rest)
    this.app.get('*', (req, res) => {
      const indexPath = path.join(__dirname, '..', '..', 'frontend', 'build', 'index.html');
      const publicIndex = path.join(__dirname, '..', '..', 'frontend', 'public', 'index.html');

      // Спочатку шукаємо production build, потім public
      res.sendFile(indexPath, (err) => {
        if (err) {
          res.sendFile(publicIndex, (err2) => {
            if (err2) {
              // Якщо frontend ще не зібраний - показуємо статусну сторінку
              res.send(this._getStatusPage());
            }
          });
        }
      });
    });
  }

  /**
   * Ініціалізує WebSocket обробники через QuizRoomManager
   *
   * Викликається після setupRoutes()
   */
  setupWebSocket() {
    this.roomManager.init();
    log('Server', 'WebSocket обробники ініціалізовано');
  }

  /**
   * Запускає сервер на налаштованому порту та хості
   *
   * Виводить інформацію про IP адресу для підключення планшетів.
   * Реєструє обробники для graceful shutdown (SIGTERM, SIGINT).
   */
  start() {
    const { port, host } = this.config.server;

    // Налаштовуємо middleware та маршрути перед запуском
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();

    // Запускаємо HTTP сервер
    this.httpServer.listen(port, host, () => {
      this.isRunning = true;

      const localIP = this.getLocalIP();

      // Виводимо красивий банер зі URL для підключення
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║       Quiz Room Auto - Запущено!       ║');
      console.log('╠════════════════════════════════════════╣');
      console.log(`║  Локально:  http://localhost:${port}     ║`);
      console.log(`║  Мережа:    http://${localIP}:${port}  ║`);
      console.log('║                                        ║');
      console.log('║  Гравці підключаються через мережу IP  ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');

      log('Server', `Сервер запущено на ${host}:${port}`);
    });

    // Обробляємо сигнали завершення для graceful shutdown
    // SIGTERM - надсилається системою при зупинці (наприклад Docker)
    process.on('SIGTERM', () => this.stop('SIGTERM'));
    // SIGINT - Ctrl+C в терміналі
    process.on('SIGINT', () => this.stop('SIGINT'));
  }

  /**
   * Плавно зупиняє сервер (graceful shutdown)
   *
   * Що робить:
   * 1. Логує причину зупинки
   * 2. Закриває HTTP сервер (чекає завершення активних запитів)
   * 3. Відключає всі Socket.IO з'єднання
   * 4. Завершує процес
   *
   * @param {string} reason - Причина зупинки (для логу)
   */
  stop(reason = 'manual') {
    log('Server', `Зупинка сервера (${reason})...`);

    // Закриваємо Socket.IO (відключаємо всіх клієнтів)
    this.io.close();

    // Закриваємо HTTP сервер
    this.httpServer.close(() => {
      log('Server', 'Сервер зупинено');
      process.exit(0);
    });

    // Якщо сервер не зупинився за 5 секунд - примусово завершуємо
    setTimeout(() => {
      log('Server', 'Примусове завершення після 5 секунд');
      process.exit(1);
    }, 5000);
  }

  /**
   * Визначає локальну IP адресу машини в мережі
   *
   * Використовується щоб показати адресу для підключення планшетів.
   * Повертає першу не-localhost IPv4 адресу з мережевих інтерфейсів.
   *
   * @returns {string} IP адреса або 'localhost' якщо не знайдено
   */
  getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        // Шукаємо IPv4 адресу що не є localhost
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }

    return 'localhost';
  }

  /**
   * Генерує HTML сторінку статусу коли фронтенд ще не зібраний
   * Показується при GET / якщо frontend/build/index.html не існує
   *
   * @returns {string} HTML рядок
   * @private
   */
  _getStatusPage() {
    const sessions = this.roomManager.getActiveSessions();
    const localIP = this.getLocalIP();

    return `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>Quiz Room Auto - Сервер</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
    .status { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; }
    .info { background: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin-top: 15px; }
    code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>🎮 Quiz Room Auto</h1>
  <div class="status">
    <strong>✅ Сервер працює!</strong><br>
    Активних сесій: ${sessions.length}
  </div>
  <div class="info">
    <strong>Підключення для гравців:</strong><br>
    Локально: <code>http://localhost:${this.config.server.port}</code><br>
    Мережа: <code>http://${localIP}:${this.config.server.port}</code>
  </div>
  <p><em>Frontend ще не зібраний. Запустіть <code>npm run build:frontend</code></em></p>
</body>
</html>`;
  }
}

// Запускаємо сервер якщо файл запущений напряму (не імпортований)
if (require.main === module) {
  const server = new QuizServer();
  server.start();
}

// Експортуємо клас для тестування
module.exports = QuizServer;

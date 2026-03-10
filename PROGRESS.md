# PROGRESS.md — Повний журнал розробки Quiz Room Auto

> Цей файл є основою для перезапуску роботи з Claude Code.
> Прочитай його повністю перед тим як продовжувати розробку.
> Останнє оновлення: 6 березня 2026 (сесія 3)

---

## 🗂 Що це за проект

**Quiz Room Auto** — комерційна система для проведення квіз-ігор у реальному часі.
Гравці підключаються зі своїх телефонів, відповідають на питання, бачать результати.
Ведучий запускає гру через браузер — все відбувається автоматично.

- **Розробник:** EduardIng
- **Репозиторій:** https://github.com/EduardIng/quiz-room-auto
- **Локальна папка:** `/Users/einhorn/quiz-room-auto`
- **Версія:** v1.3.0 (тег і push ✅)
- **Тести:** 165/165 проходять ✅
- **Збірка фронтенду:** успішна ✅
- **Останній коміт:** `3e5d470` — все закомічено і запушено на GitHub

---

## 📁 Структура проекту (повна)

```
quiz-room-auto/
├── backend/
│   ├── src/
│   │   ├── server.js                  ← Express сервер, статика, API ендпоінти
│   │   ├── websocket-handler-auto.js  ← Socket.IO обробник всіх WS подій
│   │   ├── quiz-session-auto.js       ← Машина станів одного квіз-сеансу
│   │   ├── quiz-storage.js            ← Завантаження квізів з папки quizzes/
│   │   ├── db.js                      ← SQLite база даних (better-sqlite3)
│   │   └── utils.js                   ← Логування, валідація
│   └── tests/
│       ├── session.test.js            ← 70 тестів стану сесії (+ host controls, category)
│       ├── websocket.test.js          ← 30 тестів WS обробника (+ watch-room, host-control, storage)
│       ├── quiz-storage.test.js       ← 28 тестів quiz-storage.js (сесія 4)
│       ├── db.test.js                 ← 22 тести db.js (сесія 4)
│       └── server.test.js             ← 15 тестів HTTP ендпоінтів (сесія 4)
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   ← Роутинг (#/, #/admin, #/create, #/stats)
│   │   ├── components/
│   │   │   ├── PlayerView.jsx         ← Інтерфейс гравця (9 екранів)
│   │   │   ├── PlayerView.css
│   │   │   ├── AdminPanel.jsx         ← Адмін панель (моніторинг кімнат + projector link)
│   │   │   ├── AdminPanel.css
│   │   │   ├── QuizCreator.jsx        ← Редактор квізів + host controls + projector link
│   │   │   ├── QuizCreator.css
│   │   │   ├── ProjectorView.jsx      ← Великий екран для залу (#/screen)
│   │   │   ├── ProjectorView.css
│   │   │   ├── StatsPanel.jsx         ← Статистика сесій
│   │   │   └── StatsPanel.css
│   │   ├── styles/
│   │   │   └── theme.css              ← CSS змінні, глобальні стилі
│   │   └── utils/
│   │       ├── i18n.js                ← Переклади UK/EN
│   │       ├── useLang.js             ← React хук для мови
│   │       └── sound.js               ← Web Audio API звуки
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── quizzes/
│   ├── dummy-quiz-1.json              ← Тестовий квіз (стандартний)
│   ├── dummy-quiz-2.json              ← Тестовий квіз (стандартний)
│   └── first-try.json                 ← 30-раундовий category mode квіз (збережений через UI)
├── quiz creation/
│   ├── quiz-mega-pack.json            ← 60-раундовий category mode квіз (генерований)
│   └── quiz-mega-pack-v2.json         ← Оновлена версія мега-паку
├── data/
│   └── sessions.db                    ← SQLite база (створюється автоматично)
├── RESTART/
│   └── ЯК_ЗАПУСТИТИ_ПРОЕКТ.md        ← Інструкція перезапуску (для людини)
├── config.json                        ← Налаштування сервера і гри
├── package.json                       ← Backend залежності
├── CLAUDE.md                          ← Інструкції для Claude Code
├── PROGRESS.md                        ← Цей файл
├── PROGRESS_LOG.md                    ← Детальний лог по фазах (старий формат)
├── README.md                          ← Загальна документація
├── API.md                             ← WebSocket API специфікація
├── SETUP.md                           ← Інструкція встановлення
├── USAGE.md                           ← Інструкція використання
├── DECISIONS.md                       ← Архітектурні рішення
├── KNOWN_ISSUES.md                    ← Відомі проблеми
├── LEARNING_NOTES.md                  ← Навчальні нотатки
└── GLOSSARY.md                        ← Глосарій термінів
```

---

## ✅ Що вже реалізовано — повний список по фазах

### Phase 0 — Ініціалізація проекту
- Структура папок створена
- Git репозиторій ініціалізований
- GitHub репозиторій `EduardIng/quiz-room-auto` створений
- Перший коміт зроблений

### Phase 1 — Core Backend (автоматична система)
- **`config.json`** — всі налаштування таймерів і поведінки
- **`utils.js`** — логування з часовими мітками, завантаження конфігу
- **`quiz-session-auto.js`** — повна машина станів:
  - Стани: `WAITING → STARTING → QUESTION → ANSWER_REVEAL → LEADERBOARD → ENDED`
  - Автоматичний старт при досягненні minPlayers
  - Підрахунок балів: 100 базових + бонус за швидкість
  - Тай-брейкер по середньому часу відповіді
  - Fisher-Yates перемішування питань (якщо shuffle=true)
- **`websocket-handler-auto.js`** — обробник подій Socket.IO:
  - `create-quiz` — створення кімнати
  - `join-quiz` — приєднання гравця
  - `submit-answer` — відповідь гравця
  - `get-game-state` — синхронізація стану
  - `disconnect` — відключення
- **`server.js`** — Express + Socket.IO, роздача статики
- **`quiz-storage.js`** — завантаження JSON квізів з папки quizzes/

### Phase 2 — Frontend (інтерфейс гравця)
- **`PlayerView.jsx`** — 9 екранів гравця:
  1. `join` — форма входу (код кімнати + нікнейм)
  2. `waiting` — очікування старту зі списком гравців
  3. `starting` — відлік 3-2-1
  4. `question` — питання з таймером і кнопками відповідей
  5. `answer_sent` — підтвердження відправки відповіді
  6. `reveal` — розкриття правильної відповіді з балами
  7. `leaderboard` — рейтинг між питаннями
  8. `ended` — фінальний результат
  9. `category_select` — вибір категорії (новий, Phase 8)
  10. `category_chosen` — підтвердження вибору (новий, Phase 8)
- URL параметр `?room=XXXXX` — автозаповнення коду кімнати
- **`theme.css`** — CSS змінні: кольори, радіуси, тіні, анімації

### Phase 3 — Тести
- **`session.test.js`** — 70 тестів: стани, гравці, бали, leaderboard, host controls, category mode
- **`websocket.test.js`** — 30 тестів: кімнати, join, відповіді, disconnect, watch-room, host-control, saveQuiz/deleteQuiz
- **`quiz-storage.test.js`** — 28 тестів: loadAllQuizzes, saveQuiz, deleteQuiz, loadQuizById, захист від path traversal (додано в сесії 4)
- **`db.test.js`** — 22 тести: saveSession, getSessions, getSessionResults, getStats, cleanupOldSessions, каскадне видалення (додано в сесії 4)
- **`server.test.js`** — 15 тестів: всі HTTP ендпоінти через supertest (health, quizzes, stats, qr) (додано в сесії 4)
- Всього: **165/165 тестів ✅**
- Jest налаштований у `package.json`

### Phase 4 — Документація
- `README.md`, `SETUP.md`, `USAGE.md`, `API.md`
- `DECISIONS.md`, `KNOWN_ISSUES.md`, `LEARNING_NOTES.md`, `GLOSSARY.md`

### Phase 5 — Додаткові функції
- **Question Shuffle** — `config.json → "shuffle": true` вмикає перемішування
- **Sound Effects** — Web Audio API (синтетичні звуки, без файлів):
  - `playCorrect()`, `playWrong()`, `playTimeout()`, `playTick()`, `playCountdown()`, `playFinish()`
- **Admin Panel** (`#/admin`) — моніторинг активних кімнат в реальному часі
- **Quiz Creator** (`#/create`) — візуальний редактор квізів у браузері

### Phase 6 — Розширені функції
- **SQLite база даних** (`db.js`, `better-sqlite3`):
  - Таблиці: `sessions`, `results`, `question_stats`
  - Автоматично зберігає кожну завершену гру
  - Файл: `data/sessions.db`
- **QR-коди** (бібліотека `qrcode`):
  - Ендпоінт `GET /api/qr/:roomCode` → PNG зображення
  - Відображається на екрані після створення кімнати
- **Статистика** (`StatsPanel.jsx`, `#/stats`):
  - Загальна кількість сесій, гравців, середня кількість гравців
  - Таблиця всіх сесій з топ-гравцем
  - Розгортається детальний leaderboard по кліку
- **i18n (UK/EN)**:
  - `i18n.js` — всі рядки двома мовами
  - `useLang.js` — React хук, зберігає вибір в localStorage
  - Перемикач мови в QuizCreator та AdminPanel
- **Імпорт квізів**:
  - Кнопка "⬆ Import JSON" — завантаження з файлу
  - Кнопка "📂 З бібліотеки" — список квізів з сервера
- **4 нових API ендпоінти**:
  - `GET /api/quizzes` — список квізів з папки quizzes/
  - `GET /api/stats` — агрегована статистика
  - `GET /api/stats/session/:id` — деталі однієї сесії
  - `GET /api/qr/:roomCode` — QR код

### Phase 9 — Quiz Library + Bug Fixes (6 березня 2026, сесія 2) ✅ ЗАКОМІЧЕНО

**Quiz Library (збереження квізів на сервері):**

`backend/src/quiz-storage.js`:
- Виправлена `loadAllQuizzes()` — тепер приймає і category mode квізи (`rounds[]`), не тільки стандартні (`questions[]`)
- Нова функція `saveQuiz(quizData)` — зберігає квіз як JSON файл у `quizzes/`, автоматично генерує назву файлу з title, додає суфікс `-2`, `-3`... якщо файл вже існує
- Нова функція `deleteQuiz(quizId)` — видаляє файл з `quizzes/` (захист від path traversal)
- Нова `titleToFilename()` — безпечна конвертація назви у ім'я файлу

`backend/src/server.js`:
- `POST /api/quizzes/save` — зберігає квіз з тіла запиту на диск, повертає `{ id, filename }`
- `DELETE /api/quizzes/:id` — видаляє квіз з диску

`frontend/src/components/QuizCreator.jsx`:
- Новий стейт `saveSuccess` — зелене повідомлення після збереження
- Нова функція `handleSaveToLibrary()` — POST поточного квізу на `/api/quizzes/save`
- Нова функція `handleDeleteLibraryQuiz(e, quizId, quizTitle)` — DELETE з підтвердженням
- Оновлений рендер бібліотеки: кожен елемент — рядок `.library-item-row` з кнопкою квізу і кнопкою ✕
- Виправлено лічильник у бібліотеці: category mode показує `NR` (rounds), стандарт — `NQ` (questions)
- Нова кнопка `💾 Зберегти в бібліотеку` в `.creator-actions`

`frontend/src/components/QuizCreator.css`:
- `.creator-save-success` — зелене повідомлення про успіх
- `.btn-save-library` — стиль кнопки збереження (зелений відтінок)
- `.library-item-row` — flex-рядок для елемента бібліотеки
- `.library-delete-btn` — кнопка ✕ (червоніє при hover)

`frontend/src/utils/i18n.js`:
- Новий ключ `saveToLibrary`: `'💾 Зберегти в бібліотеку'` / `'💾 Save to library'`

**Виправлення критичного бага — відповіді завжди помилкові:**

`frontend/src/components/PlayerView.jsx`:
- **Баг:** socket listener реєструвався один раз (`useEffect` з `[]`), захоплюючи `handleServerUpdate` з початковими значеннями `question=null` і `myNickname=''`. Кожен `REVEAL_ANSWER` викликав застарілий обробник — нікнейм не знаходився → `isCorrect=false`, текст відповіді був порожнім.
- **Виправлення:** Доданий `handleServerUpdateRef = useRef(null)` — оновлюється після кожного рендеру через `useEffect(() => { handleServerUpdateRef.current = handleServerUpdate; })`. Socket listener тепер викликає `handleServerUpdateRef.current(data)` — завжди актуальна версія.
- Доданий `questionRef = useRef(null)` — синхронізується при `setQuestion()`. `handleRevealAnswer` читає `questionRef.current` замість `question` зі стейлого closure.
- `handleRevealAnswer` — видалено `question` з deps array (тепер читає через ref)

### Phase 7 — Медіа питання + UX покращення
- **Image questions** — поле `"image": "url"` у питанні:
  - QuizCreator: поле вводу URL + живий превʼю мініатюри + бейдж 🖼
  - PlayerView: зображення над текстом питання (max 220px)
- **Music questions** — поле `"audio": "url"` у питанні:
  - QuizCreator: поле вводу URL + HTML5 аудіо-плеєр для превʼю
  - PlayerView: автовідтворення при показі питання + кнопка повтору + зупинка при reveal
- **Drag-to-reorder** в QuizCreator:
  - Перетягування питань для зміни порядку
  - Іконка ⠿ як ручка для перетягування
  - Візуальний індикатор куди впаде питання

### Phase 8 — Category Mode (6 березня 2026) ✅ ЗАКОМІЧЕНО

**Концепція:**
- Новий режим гри де перед кожним питанням один гравець (по черзі в порядку приєднання) обирає між двома категоріями
- Після leaderboard — наступний гравець обирає категорію для наступного питання
- Таймер 15 секунд — якщо не обрав, сервер обирає випадково

**Новий стан-флоу:**
```
Стандарт:  WAITING → STARTING → QUESTION → ANSWER_REVEAL → LEADERBOARD → (repeat) → ENDED
Категорії: WAITING → STARTING → CATEGORY_SELECT → [1с CATEGORY_CHOSEN] → QUESTION → ... → ENDED
```

**Новий формат JSON квізу:**
```json
{
  "title": "Geo vs History",
  "categoryMode": true,
  "rounds": [
    {
      "options": [
        { "category": "Географія", "question": "...", "answers": ["","","",""], "correctAnswer": 0 },
        { "category": "Історія",   "question": "...", "answers": ["","","",""], "correctAnswer": 2 }
      ]
    }
  ]
}
```

**Змінені файли:**

`backend/src/quiz-session-auto.js`:
- Нові поля конструктора: `isCategoryMode`, `rounds`, `chooserIndex`, `playerJoinOrder`, `currentChooserSocketId`, `categorySelectTimer`, `categorySelectTime`
- `addPlayer()` — додає socketId до `playerJoinOrder`
- `removePlayer()` — видаляє з `playerJoinOrder`, коригує `chooserIndex`, авто-вирішує якщо chooser відключився під час `CATEGORY_SELECT`
- `startQuiz()` — після 3с: або `startCategorySelect()` або `nextQuestion()`
- `showLeaderboard()` — після leaderboard: або `startCategorySelect()` або `nextQuestion()`
- `nextQuestion()` / `endQuiz()` — використовують `rounds.length` або `questions.length` залежно від режиму
- **Новий:** `startCategorySelect()` — встановлює стан, вибирає chooser по ротації, broadcast `CATEGORY_SELECT`, запускає таймер
- **Новий:** `submitCategory(socketId, choiceIndex)` — приймає вибір, скасовує таймер, викликає `_resolveCategory`
- **Новий:** `_resolveCategory(roundIndex, choiceIndex, wasTimeout)` — будує об'єкт питання з обраної опції, додає в `quizData.questions`, broadcast `CATEGORY_CHOSEN`, через 1с запускає `nextQuestion()`

`backend/src/websocket-handler-auto.js`:
- Новий обробник: `socket.on('submit-category', ...)`
- Новий метод: `handleSubmitCategory()` — валідує choiceIndex (0 або 1), викликає `session.submitCategory()`
- Оновлений `handleCreateQuiz()` — окрема гілка валідації для `categoryMode: true` квізів (перевіряє rounds, options, category, answers)

`frontend/src/utils/i18n.js`:
- 11 нових ключів в обох мовах: `youChoose`, `waitingForChooser`, `categoryTimeLeft`, `categoryChosen`, `categoryAutoChosen`, `categoryMode`, `categoryModeHint`, `round`, `addRound`, `option`, `categoryName`, `categoryNamePlaceholder`

`frontend/src/components/PlayerView.jsx`:
- Нові стейти: `categoryOptions`, `categoryChooser`, `categoryTimeLeft`, `categoryTimeLimit`, `categoryChosen`, `categoryTimerRef`
- Нові case в `handleServerUpdate`: `CATEGORY_SELECT` (запускає клієнтський countdown), `CATEGORY_CHOSEN` (зупиняє countdown)
- Новий обробник: `handleCategoryClick(choiceIndex)` — emit `submit-category`
- `handlePlayAgain()` — очищає також category стейт і таймер
- Новий екран `category_select`:
  - Таймер-бар зверху
  - Якщо це твій вибір: 2 великі кнопки з назвами категорій
  - Якщо чужий вибір: іконка 🎲 + текст "Чекаємо поки {ім'я} обере..."
- Новий екран `category_chosen`:
  - 🎯 + велика назва категорії + "(авто-вибір)" якщо таймаут

`frontend/src/components/PlayerView.css`:
- Нові стилі: `.category-select-screen`, `.category-timer-bar-wrapper`, `.category-timer-bar`, `.category-timer-text`, `.category-buttons`, `.category-btn` (фіолетовий/помаранчевий), `.category-wait-icon`, `.category-wait-text`, `.category-chosen-name`

`frontend/src/components/QuizCreator.jsx`:
- Нові стейти: `categoryMode`, `rounds`, `activeRound`
- Нові шаблони: `EMPTY_OPTION()`, `EMPTY_ROUND()`
- Нові хелпери: `addRound()`, `removeRound(i)`, `updateRoundOption()`, `updateRoundOptionAnswer()`
- `validate()` — окрема гілка для categoryMode
- `handleCreateRoom()` — будує `{ title, categoryMode: true, rounds }` або стандартний об'єкт
- `handleExportJSON()` — підтримує обидва формати
- `handleImportFile()` / `handleSelectLibraryQuiz()` — детектує `quiz.categoryMode`, завантажує rounds або questions
- `handleReset()` — скидає також category стейт
- Sidebar: чекбокс "Category Mode" + підказка; список раундів (R1, R2... "кат А / кат Б") замість питань
- Main panel (category mode): двоколонна сітка `.options-grid` з двома `.option-panel` (фіолетовий/помаранчевий верхній бордер); кожна колонка: назва категорії + текст питання + 4 відповіді + вибір правильної

`frontend/src/components/QuizCreator.css`:
- Нові стилі: `.category-mode-toggle`, `.options-grid` (2 колонки, 1 на ≤700px), `.option-panel`, `.option-panel-0` (фіолетовий), `.option-panel-1` (помаранчевий), `.option-header`

---

### Phase 10 — Projector View + Host Controls + Rate Limiting + DB Cleanup (сесія 3) ✅ ЗАКОМІЧЕНО

**Projector/Big Screen View (`#/screen`):**
- `ProjectorView.jsx` — повний компонент для телевізора/проектора:
  - Підключення як спостерігач через `watch-room` (не гравець)
  - Автосинхронізація початкового стану через `getState()`
  - Екрани: enter_code, connecting, WAITING (QR + список гравців), STARTING (відлік), CATEGORY_SELECT (таймер-бар + 2 варіанти), CATEGORY_CHOSEN, QUESTION (таймер + відповіді + лічильник), ANSWER_REVEAL (зелена правильна відповідь), LEADERBOARD/ENDED
  - Пауза-оверлей поверх усього
  - QR-код через `/api/qr/:roomCode`
- `ProjectorView.css` — стилі під 1920×1080, великі шрифти, контрасні кольори
- `main.jsx` — новий маршрут `#/screen` → `<ProjectorView />`

**Host Controls (у QuizCreator після створення кімнати):**
- Кнопки: ▶ Start / ⏸ Pause ↔ ▶ Resume / ⏭ Skip
- Socket listener для GAME_PAUSED / GAME_RESUMED оновлює стан кнопок
- Бейдж "Гра на паузі" при активній паузі
- Посилання 📺 Projector View → відкриває `#/screen?room=CODE` в новій вкладці

**AdminPanel:**
- Кожна карточка активної кімнати має посилання 📺 Projector View

**Backend (quiz-session-auto.js):**
- `pauseGame()` — зупиняє таймер, зберігає `questionTimeRemaining`, broadcast GAME_PAUSED
- `resumeGame()` — відновлює таймер з `questionTimeRemaining`, коригує `questionStartTime`, broadcast GAME_RESUMED
- `skipQuestion()` — QUESTION→endQuestion, ANSWER_REVEAL→showLeaderboard, LEADERBOARD→next/end, CATEGORY_SELECT→авто-вирішення
- `forceStart()` — запускає гру зі стану WAITING
- `getState()` розширений: `isPaused`, `timeRemaining`, `timeLimit`, `currentQuestion` (без правильної відповіді), `correctAnswer` (тільки в ANSWER_REVEAL), `leaderboard` (в LEADERBOARD/ENDED)

**Backend (websocket-handler-auto.js):**
- `watch-room` → `handleWatchRoom()`: socket.join(roomCode), записує в `observers` Map, повертає `getState()`
- `host-control` → `handleHostControl()`: перевіряє `roomHosts.get(roomCode) === socket.id`, виконує pause/resume/skip/start
- Rate limiting: `answerRateLimit` Map, max 10 `submit-answer` на 30с per socket
- `handleDisconnect`: очищає `observers`, `answerRateLimit`, `roomHosts`

**Backend (db.js):**
- `cleanupOldSessions(daysOld=90)` — каскадне видалення question_stats → results → sessions в транзакції

**Backend (server.js):**
- Auto DB cleanup при старті та кожні 24 години

**Quiz-mega-pack-v2.json:**
- Переупорядковані 30 раундів через 1-факторизацію K₆
- 0 послідовних повторень категорій, 15 унікальних пар, кожна пара рівно 2 рази

**Тести:**
- `session.test.js`: +26 нових тестів (pauseGame, resumeGame, forceStart, skipQuestion × 4, startCategorySelect, submitCategory × 4)
- `websocket.test.js`: +8 нових тестів (handleWatchRoom × 4, handleHostControl × 7, saveQuiz/deleteQuiz × 6)
- **Разом (Phase 10): 100/100 ✅**

---

## ✅ Сесія 4 — 10 березня 2026 (документація + тести)

**Що зроблено:**
- **CLAUDE.md** — оптимізований з 46 683 до 22 183 символів (−53%); додано блок "STARTING A NEW SESSION", оновлено правила PROGRESS_LOG.md/PROGRESS.md
- **PROGRESS.md** — виправлено: версії таблиця (v1.3.0), KI таблиця (KI-007/KI-008), "Що обговорювалось", рекомендований наступний крок, футер
- **LEARNING_NOTES.md** — виправлено назви станів машини станів (LOBBY→WAITING, FINISHED→ENDED тощо)
- **API.md** — виправлено опис POST /api/quizzes/save (суфікс замість перезапису)
- **README.md** — виправлено кількість екранів PlayerView (7→10)
- **SETUP.md** — додано Category Mode, Projector View, Host Controls; виправлено frontend dev команду (localhost:5173); виправлено config.json приклад (shuffle)
- **GLOSSARY.md** — додано 8 нових термінів (Category Mode, Chooser, Host Controls тощо)

**Нові тест-файли (65 нових тестів):**
- `backend/tests/quiz-storage.test.js` — 28 тестів для quiz-storage.js
- `backend/tests/db.test.js` — 22 тести для db.js
- `backend/tests/server.test.js` — 15 тестів для HTTP ендпоінтів (supertest)

**Зміни вихідного коду для тест-ізоляції:**
- `backend/src/db.js` — `DB_PATH` тепер читає `process.env.TEST_DB_PATH` (1 рядок)
- `backend/src/quiz-storage.js` — `QUIZZES_DIR` тепер читає `process.env.TEST_QUIZZES_DIR` (1 рядок)

**Нові залежності:**
- `supertest` (devDependency) — HTTP endpoint testing

**Результат:** 165/165 тестів ✅

---

## ⚠️ Що НЕ зроблено

1. **PROGRESS_LOG.md** — оновлений в сесії 4 (нижче), але фазові записи Phase 8-10 відсутні (не критично)

---

## 🔌 WebSocket події (повний список)

### Клієнт → Сервер
| Подія | Дані | Відповідь |
|-------|------|-----------|
| `create-quiz` | `{ quizData, settings }` | `{ success, roomCode }` |
| `join-quiz` | `{ roomCode, nickname }` | `{ success, gameState, nickname }` |
| `submit-answer` | `{ answerId: 0-3 }` | `{ success }` |
| `submit-category` | `{ choiceIndex: 0-1 }` | `{ success }` |
| `get-game-state` | `{ roomCode }` | `{ success, gameState }` |
| `watch-room` | `{ roomCode }` | `{ success, gameState }` (спостерігач/Projector) |
| `host-control` | `{ roomCode, action: 'pause'\|'resume'\|'skip'\|'start' }` | `{ success }` (тільки хост) |

### Сервер → Клієнт (подія `quiz-update`)
| type | Коли | Ключові поля |
|------|------|--------------|
| `PLAYER_JOINED` | Хтось приєднався | `players`, `totalPlayers` |
| `PLAYER_LEFT` | Хтось відключився | `nickname`, `players` |
| `QUIZ_STARTING` | Старт відліку | `countdown: 3`, `totalQuestions` |
| `CATEGORY_SELECT` | Перед питанням (category mode) | `chooserNickname`, `options [{index, category}]`, `roundIndex`, `totalRounds`, `timeLimit` |
| `CATEGORY_CHOSEN` | Категорія обрана | `category`, `choiceIndex`, `wasTimeout` |
| `NEW_QUESTION` | Нове питання | `questionIndex`, `totalQuestions`, `question {text, answers, image?, audio?}`, `timeLimit` |
| `ANSWER_COUNT` | Хтось відповів | `answered`, `total` |
| `GAME_PAUSED` | Хост поставив на паузу | `timeRemaining` |
| `GAME_RESUMED` | Хост відновив гру | `timeRemaining` |
| `REVEAL_ANSWER` | Час вийшов / всі відповіли | `correctAnswer`, `statistics`, `playerResults` |
| `SHOW_LEADERBOARD` | Після reveal | `leaderboard`, `isLastQuestion` |
| `QUIZ_ENDED` | Після останнього leaderboard | `finalLeaderboard`, `totalQuestions` |

---

## 🌐 HTTP API ендпоінти

| Метод | Шлях | Що повертає |
|-------|------|-------------|
| GET | `/health` | `{ status: "ok", uptime, activeSessions }` |
| GET | `/api/active-quizzes` | Список активних кімнат |
| GET | `/api/quizzes` | Список квізів з папки quizzes/ (стандартні + categoryMode) |
| POST | `/api/quizzes/save` | Зберегти квіз на диск → `{ id, filename }` |
| DELETE | `/api/quizzes/:id` | Видалити квіз з диску |
| GET | `/api/stats` | Агрегована статистика + список сесій |
| GET | `/api/stats/session/:id` | Деталі одної сесії |
| GET | `/api/qr/:roomCode` | PNG QR-код (200x200) |

---

## ⚙️ config.json — поточні значення

```json
{
  "server": { "port": 8080, "host": "0.0.0.0" },
  "quiz": {
    "questionTime": 30,
    "answerRevealTime": 5,
    "leaderboardTime": 5,
    "autoStart": true,
    "waitForAllPlayers": true,
    "minPlayers": 1,
    "maxPlayers": 8,
    "shuffle": false
  }
}
```

---

## 🔢 Версії та теги

| Тег | Що включає |
|-----|-----------|
| `v1.0.0` | Phase 0-5: базова система + shuffle + звуки + admin + creator |
| `v1.1.0` | Phase 6: SQLite + QR + stats + i18n + import |
| `v1.2.0` | Phase 7: image/audio питання + drag-to-reorder |
| `v1.3.0` | Phase 8-10: Category Mode + Quiz Library + answer reveal fix + Projector View + Host Controls + rate limiting + DB cleanup |

---

## 🐛 Відомі проблеми (з KNOWN_ISSUES.md)

| ID | Проблема |
|----|---------|
| KI-001 | QR код кодує IP при створенні — застаріє якщо IP змінився |
| KI-002 | `better-sqlite3` потребує `node-gyp` для збірки |
| KI-003 | Stats panel робить окремий запит на кожен розгорнутий рядок |
| KI-004 | Мова зберігається окремо в кожному браузері |
| KI-007 | Браузерна autoplay policy може заблокувати аудіо питання |
| KI-008 | Зовнішні media URLs можуть бути заблоковані CORS |

Повний список з workarounds — у `KNOWN_ISSUES.md`.

---

## 💡 Що обговорювалось але НЕ реалізовано

1. ~~**Projector / Big Screen View**~~ — **реалізовано в Phase 10** (`ProjectorView.jsx`, `#/screen`)
2. ~~**Host Controls**~~ — **реалізовано в Phase 10** (pause/resume/skip/start у QuizCreator)
3. **Team Mode** — командна гра замість індивідуальної (не реалізовано, низький пріоритет)

---

## 🚀 Як продовжувати розробку

### Перший крок після перезапуску
Скажи мені:
> "Прочитай CLAUDE.md і PROGRESS.md і продовжуй розробку. Ось що я хочу зробити: [завдання]"

### Рекомендований наступний крок
Проект на v1.3.0, все закомічено, запушено, теговано. Всі заплановані фічі реалізовані.

Можливі напрямки:
1. Оновити **SETUP.md** — додати інформацію про category mode, projector view, host controls
2. Реалізувати **Team Mode** — командна гра (єдина нереалізована запланована фіча)
3. Будь-яка нова фіча за запитом користувача

---

*Цей файл оновлено 7 березня 2026 (сесія 4) — виправлено застарілі записи після Phase 10 (Projector View + Host Controls)*

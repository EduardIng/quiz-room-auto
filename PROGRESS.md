# PROGRESS.md — Повний журнал розробки Quiz Room Auto

> Цей файл є основою для перезапуску роботи з Claude Code.
> Прочитай його повністю перед тим як продовжувати розробку.
> Останнє оновлення: 6 березня 2026 (сесія 2)

---

## 🗂 Що це за проект

**Quiz Room Auto** — комерційна система для проведення квіз-ігор у реальному часі.
Гравці підключаються зі своїх телефонів, відповідають на питання, бачать результати.
Ведучий запускає гру через браузер — все відбувається автоматично.

- **Розробник:** EduardIng
- **Репозиторій:** https://github.com/EduardIng/quiz-room-auto
- **Локальна папка:** `/Users/einhorn/quiz-room-auto`
- **Версія:** v1.3.0 (закомічено, не тегована)
- **Тести:** 66/66 проходять ✅
- **Збірка фронтенду:** успішна ✅
- **Останній коміт:** `bf72b5d` — все закомічено і запушено на GitHub

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
│       ├── session.test.js            ← 44 тести стану сесії
│       └── websocket.test.js          ← 22 тести WS обробника
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   ← Роутинг (#/, #/admin, #/create, #/stats)
│   │   ├── components/
│   │   │   ├── PlayerView.jsx         ← Інтерфейс гравця (9 екранів)
│   │   │   ├── PlayerView.css
│   │   │   ├── AdminPanel.jsx         ← Адмін панель (моніторинг кімнат)
│   │   │   ├── AdminPanel.css
│   │   │   ├── QuizCreator.jsx        ← Редактор квізів (стандарт + категорії)
│   │   │   ├── QuizCreator.css
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
- **`session.test.js`** — 44 тести: стани, гравці, бали, leaderboard
- **`websocket.test.js`** — 22 тести: кімнати, join, відповіді, disconnect
- Всього: **66/66 тестів ✅**
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

## ⚠️ Що НЕ зроблено (залишається після Phase 9)

1. **Не оновлено документацію** — README, API.md, USAGE.md, SETUP.md не містять інформації про category mode та quiz library
2. **PROGRESS_LOG.md не оновлений** — старий лог-файл зупинився на Phase 7
3. **Не додано тести** — для `startCategorySelect`, `submitCategory`, `_resolveCategory`, `saveQuiz`, `deleteQuiz`
4. **Не тегована нова версія** — остання теґ v1.2.0, поточний код відповідає v1.3.0
5. **Немає Projector/Big Screen View** — `#/screen` сторінки для телевізора немає (обговорювалось але не реалізовано)

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
| (не тегована) | Phase 8+9: Category Mode + Quiz Library + answer reveal bug fix — закомічено, не тегована |

---

## 🐛 Відомі проблеми (з KNOWN_ISSUES.md)

| ID | Проблема |
|----|---------|
| KI-001 | QR код кодує IP при створенні — застаріє якщо IP змінився |
| KI-002 | `better-sqlite3` потребує `node-gyp` для збірки |
| KI-003 | Stats panel робить окремий запит на кожен розгорнутий рядок |
| KI-004 | Мова зберігається окремо в кожному браузері |
| KI-005 | Немає автоматичного видалення старих сесій з БД |
| KI-006 | Немає захисту від flood атак на submit-answer |

---

## 💡 Що обговорювалось але НЕ реалізовано

1. **Projector / Big Screen View** (`#/screen`) — велике відображення для телевізора в залі. Пріоритет: HIGH. Показує поточне питання, countdown, live лічильник відповідей, leaderboard після питання. Повністю окремий компонент від PlayerView.
2. **Host Controls** — ручне керування темпом гри (пауза, наступне питання)
3. **Team Mode** — командна гра замість індивідуальної

---

## 🚀 Як продовжувати розробку

### Перший крок після перезапуску
Скажи мені:
> "Прочитай CLAUDE.md і PROGRESS.md і продовжуй розробку. Ось що я хочу зробити: [завдання]"

### Рекомендований наступний крок
Все закомічено і запушено. Наступні пріоритети:
1. Тегувати `v1.3.0`: `git tag -a v1.3.0 -m "Category Mode + Quiz Library" && git push --tags`
2. Реалізувати **Projector/Big Screen View** (`#/screen`) — найбільший пріоритет нової функції
3. Додати тести для Phase 8+9 методів

### Або — нова функція
Найбільший пріоритет що ще не реалізований: **Projector/Big Screen View** (`#/screen`)

---

*Цей файл оновлено 6 березня 2026 (сесія 2) після завершення Phase 9 (Quiz Library + bug fixes)*

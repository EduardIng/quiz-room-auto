# ІНСТРУКЦІЯ ДЛЯ CLAUDE CODE - Quiz Room Automation Project

**Project Name:** quiz-room-auto  
**Developer:** EduardIng  
**Target:** Commercial quiz room system with automatic question progression  
**Base:** Quiz Mate (https://github.com/david-04/quiz-mate)  
**Version:** 1.0  
**Date:** March 4, 2026

---

## 📋 TABLE OF CONTENTS

1. [CRITICAL RULES](#critical-rules)
2. [SYSTEM VERIFICATION](#system-verification)
3. [GITHUB SETUP](#github-setup)
4. [PROJECT INITIALIZATION](#project-initialization)
5. [IMPLEMENTATION PHASES](#implementation-phases)
6. [QUALITY CONTROLS](#quality-controls)
7. [PROGRESS TRACKING](#progress-tracking)
8. [COMMUNICATION PROTOCOLS](#communication-protocols)
9. [TECHNICAL SPECIFICATIONS](#technical-specifications)

---

## 🚨 CRITICAL RULES

### Communication Language
- **Primary language:** Ukrainian (for all explanations to user)
- **Code comments:** Ukrainian (багато коментарів для кожної функції)
- **Git commits:** English (industry standard)
- **Documentation:** English (README, API docs, etc.)
- **Technical terms:** Explain in Ukrainian first time, then use with explanation in parentheses

### Automation Level
- **Fully automatic** - proceed without asking EXCEPT:
  - ❓ When uncertain about implementation approach
  - ❓ Before starting each new Phase
  - ❓ When encountering errors that cannot be auto-resolved
  - ❓ When multiple valid solutions exist

### Before Asking User
**ALWAYS provide:**
1. Clear explanation of the situation (Ukrainian)
2. Suggested solution(s) with pros/cons
3. What you recommend and why
4. Option to proceed with recommendation or choose alternative

**Example:**
```
⚠️ ПОТРІБНЕ РІШЕННЯ

Ситуація: Для WebSocket з'єднання є 2 підходи:

Option A: Socket.IO (рекомендую)
  ✅ Простіше в імплементації
  ✅ Автоматичний reconnect
  ✅ Fallback на HTTP long-polling
  
Option B: Native WebSocket
  ✅ Менше залежностей
  ❌ Більше коду для reconnect logic

💡 Рекомендую: Option A (Socket.IO)
Причина: Надійніше для production, менше багів

Продовжити з Socket.IO? [Так/Option B/Обговорити]
```

### Error Handling
1. **Try to fix automatically** (2-3 alternative approaches)
2. **If cannot fix:** Show error + proposed solution + ask confirmation
3. **Never proceed** with broken code

### Code Quality Standards
- **Extensive comments** in Ukrainian explaining WHAT and WHY
- **Code review** before every commit
- **Performance check** before merge
- **Security validation** for all user inputs
- **Auto-documentation** generation

---

## ✅ SYSTEM VERIFICATION

### Pre-Flight Checklist

**DONE ✅ (Already verified by user):**
- Node.js: v25.6.0 (Latest)
- npm: v11.8.0 (Latest)
- macOS: 26.2 (Sequoia)
- MacBook: Air M1 2013
- Free space: 56GB
- Ports 80, 8080: Available
- GitHub: EduardIng / Token configured

**YOU MUST VERIFY:**
```bash
# Run these commands and confirm all pass:

# 1. Git installed
git --version
# Expected: git version 2.x.x

# 2. Can create directories
mkdir -p ~/test-quiz-room && rm -rf ~/test-quiz-room
# Expected: No error

# 3. Network connectivity
ping -c 1 github.com
# Expected: 1 packet received

# 4. SSH/HTTPS to GitHub
git ls-remote https://github.com/david-04/quiz-mate.git
# Expected: List of refs
```

**If ANY check fails:**
1. Stop immediately
2. Show which check failed
3. Explain what it means (Ukrainian)
4. Provide solution
5. Wait for confirmation

---

## 🔐 GITHUB SETUP

### Credentials
```
Username: EduardIng
Token: [REDACTED - set via git credential or environment]
Repository: quiz-room-auto (NEW - you will create it)
```

### Initial Repository Setup

**Step 1: Configure Git**
```bash
git config --global user.name "EduardIng"
git config --global user.email "eduarding@users.noreply.github.com"
```

**Step 2: Create Repository Structure**
```bash
# Create project directory
mkdir -p ~/quiz-room-auto
cd ~/quiz-room-auto

# Initialize git
git init
git branch -M main
```

**Step 3: Create Initial Files**

Create these files BEFORE first commit:

1. `.gitignore`
2. `README.md` (basic structure)
3. `PROGRESS_LOG.md` (empty, ready for updates)
4. `GLOSSARY.md` (empty, ready for terms)

**Step 4: First Commit**
```bash
git add .
git commit -m "init: Initial project structure"
```

**Step 5: Create GitHub Repository**

Since you cannot create repo via API without additional permissions, **INFORM USER:**

```
📢 ПОТРІБНА ДІЯ ВІД ТЕБЕ

Треба створити repository на GitHub. Це займе 1 хвилину:

1. Іди на: https://github.com/new
2. Repository name: quiz-room-auto
3. Description: Automated quiz room system for commercial use
4. Visibility: Public (або Private якщо хочеш)
5. НЕ ставь галочки на "Initialize with README" (у нас вже є)
6. Натисни "Create repository"

Коли створиш - напиши "готово" і я продовжу!
```

**Step 6: Connect to GitHub** (after user confirms)
```bash
git remote add origin https://github.com/EduardIng/quiz-room-auto.git
git push -u origin main
```

**Verify push succeeded:**
```
✅ Repository created and pushed
📍 URL: https://github.com/EduardIng/quiz-room-auto
```

---

## 📁 PROJECT INITIALIZATION

### Directory Structure

Create this EXACT structure:

```
quiz-room-auto/
├── .gitignore
├── README.md
├── PROGRESS_LOG.md
├── GLOSSARY.md
├── DECISIONS.md
├── KNOWN_ISSUES.md
├── LEARNING_NOTES.md
├── package.json
├── config.json
│
├── backend/
│   ├── src/
│   │   ├── server.js
│   │   ├── quiz-session-auto.js
│   │   ├── websocket-handler-auto.js
│   │   ├── quiz-storage.js
│   │   └── utils.js
│   └── tests/
│       ├── session.test.js
│       └── websocket.test.js
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── sounds/
│   │   │   ├── correct.mp3
│   │   │   ├── wrong.mp3
│   │   │   └── timeout.mp3
│   │   └── images/
│   │       └── .gitkeep
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── PlayerView.jsx
│   │   │   ├── AdminPanel.jsx (optional)
│   │   │   └── QuizCreator.jsx (optional)
│   │   └── styles/
│   │       ├── PlayerView.css
│   │       └── theme.css
│   │
│   └── package.json
│
├── quizzes/
│   ├── dummy-quiz-1.json
│   ├── dummy-quiz-2.json
│   └── README.md
│
└── scripts/
    ├── start-server.sh
    └── test-system.sh
```

### Initial Documentation Files

**README.md** - Create with this structure:
```markdown
# Quiz Room Auto - Automated Quiz System

🎮 Automated quiz room system for commercial venues

## Current Status
Phase 0: ⏳ In Progress
Last Updated: [AUTO-UPDATE DATE]

## Quick Start
[Will be added in Phase 1]

## Documentation
- [Progress Log](PROGRESS_LOG.md)
- [Technical Glossary](GLOSSARY.md)
- [Known Issues](KNOWN_ISSUES.md)
- [Decision Log](DECISIONS.md)

## Tech Stack
- Backend: Node.js, Express, Socket.IO
- Frontend: React
- Real-time: WebSocket (Socket.IO)

## License
Based on Quiz Mate (ISC License)
```

**PROGRESS_LOG.md** - Start with template:
```markdown
# Progress Log - Quiz Room Auto

## Visual Progress Tracker
```
Phase 0: System Setup        [██████████] 100% ✅
Phase 1: Core Automation     [░░░░░░░░░░]   0%
Phase 2: Player Interface    [░░░░░░░░░░]   0%
Phase 3: Testing & Polish    [░░░░░░░░░░]   0%
Phase 4: Documentation       [░░░░░░░░░░]   0%
Phase 5: Optional Features   [░░░░░░░░░░]   0%
```

## Session Log

### Session 1 - [AUTO-DATE]
**Duration:** [AUTO-CALCULATE]
**Completed:**
- [AUTO-FILL]

**Next:**
- [AUTO-FILL]

---
```

**GLOSSARY.md** - Technical terms in Ukrainian:
```markdown
# Technical Glossary - Технічний Глосарій

## A
**API (Application Programming Interface)** - Інтерфейс програмування додатків. Набір правил як програми спілкуються між собою.

## B
**Backend** - Серверна частина додатку. Та частина що працює на сервері (MacBook).

## C
**Commit** - Збереження змін в Git. Як "checkpoint" в грі.

[AUTO-ADD more terms as they appear in code]
```

### package.json (Root)

```json
{
  "name": "quiz-room-auto",
  "version": "1.0.0",
  "description": "Automated quiz room system for commercial quiz venues",
  "main": "backend/src/server.js",
  "scripts": {
    "start": "node backend/src/server.js",
    "dev": "nodemon backend/src/server.js",
    "test": "jest",
    "build:frontend": "cd frontend && npm run build"
  },
  "keywords": ["quiz", "trivia", "websocket", "real-time", "automated"],
  "author": "EduardIng",
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22",
    "jest": "^29.5.0"
  }
}
```

**After creating package.json:**
```bash
npm install
```

### .gitignore

```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production build
/frontend/build
/backend/dist

# Environment
.env
.env.local
.env.production

# macOS
.DS_Store

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Testing
coverage/

# Temporary
*.tmp
.cache/
```

---

## 🚀 IMPLEMENTATION PHASES

### PHASE 0: Project Setup ✅

**YOU ARE HERE** - Complete this phase first!

**Tasks:**
1. ✅ System verification (done)
2. ✅ GitHub setup (in progress)
3. ⏳ Create directory structure
4. ⏳ Initialize documentation files
5. ⏳ Install dependencies
6. ⏳ First commit and push

**When Phase 0 complete:**
```
📢 ПОВІДОМЛЕННЯ ДЛЯ КОРИСТУВАЧА

✅ Phase 0 завершено успішно!

Що зроблено:
- ✅ Створено структуру проєкту
- ✅ Налаштовано Git та GitHub
- ✅ Встановлено залежності
- ✅ Створено базову документацію
- ✅ Перший commit запушено на GitHub

📊 Статус: Готові до Phase 1 (Core Automation)

⏱️ Estimated time for Phase 1: 4-6 годин роботи

🎯 Phase 1 включає:
- Створення server.js (основний сервер)
- Створення quiz-session-auto.js (автоматична логіка гри)
- Створення websocket-handler-auto.js (WebSocket події)
- Налаштування config.json (конфігурація таймерів)

Продовжити з Phase 1? [Так/Показати деталі/Пауза]
```

---

### PHASE 1: Core Automation (CRITICAL)

**Estimated Time:** 4-6 hours  
**Priority:** CRITICAL - nothing works without this

**Objectives:**
- Automatic question progression
- Server-side state machine
- WebSocket communication
- Configurable timers

#### Task 1.1: config.json

**File:** `config.json`  
**Purpose:** Конфігурація всіх таймерів та поведінки системи

**Requirements:**
- All timers configurable
- Validation of values
- Sensible defaults
- Comments explaining each option

**Structure:**
```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "quiz": {
    "autoMode": true,
    "questionTime": 30,
    "answerRevealTime": 5,
    "leaderboardTime": 5,
    "autoStart": true,
    "waitForAllPlayers": true,
    "minPlayers": 1,
    "maxPlayers": 8
  },
  "display": {
    "fullscreen": true,
    "fontSize": "large"
  },
  "sounds": {
    "enabled": true,
    "volume": 0.7
  }
}
```

**Code Requirements:**
- Validation function for config values
- Default fallbacks if config missing
- Type checking (numbers are numbers, booleans are booleans)

**Ukrainian Comments Required:**
```javascript
/**
 * Завантажує та валідує конфігурацію
 * 
 * Перевіряє:
 * - Чи існує файл config.json
 * - Чи всі значення правильного типу
 * - Чи значення в допустимих межах
 * 
 * @returns {Object} Валідна конфігурація з defaults
 */
```

#### Task 1.2: server.js

**File:** `backend/src/server.js`  
**Purpose:** Головний сервер - Express + Socket.IO

**Responsibilities:**
- Initialize Express server
- Initialize Socket.IO
- Serve static files
- Handle HTTP routes
- Initialize WebSocket handlers
- Graceful shutdown

**Key Functions:**
1. `setupMiddleware()` - Configure Express
2. `setupRoutes()` - API endpoints
3. `setupWebSocket()` - Socket.IO init
4. `start()` - Start server
5. `stop()` - Graceful shutdown
6. `getLocalIP()` - Get network IP for display

**API Endpoints Required:**
- `GET /health` - Health check
- `GET /api/active-quizzes` - List active quiz rooms
- `GET /` - Serve frontend (index.html)

**Code Quality:**
- Extensive Ukrainian comments
- Error handling for all functions
- Logging for important events
- Performance monitoring hooks

**Example Comment Style:**
```javascript
/**
 * Налаштовує всі Express middleware
 * 
 * Додає:
 * - Body parser для JSON
 * - CORS для доступу з інших пристроїв
 * - Static files для frontend
 * - Request logging
 * 
 * Викликається один раз при старті сервера
 */
setupMiddleware() {
  // Body parser - дозволяє читати JSON з request body
  this.app.use(express.json());
  
  // CORS - дозволяє планшетам підключатись з інших IP
  this.app.use(cors());
  
  // ... і так далі для КОЖНОЇ лінії коду
}
```

#### Task 1.3: quiz-session-auto.js

**File:** `backend/src/quiz-session-auto.js`  
**Purpose:** Серце системи - автоматична логіка гри

**This is the MOST IMPORTANT file!**

**State Machine:**
```
WAITING → STARTING → QUESTION → ANSWER_REVEAL → LEADERBOARD → (repeat) → ENDED
```

**Class Structure:**
```javascript
class AutoQuizSession {
  constructor(quizData, settings)
  init(io, roomCode)
  
  // Player management
  addPlayer(socketId, nickname)
  removePlayer(socketId)
  allPlayersAnswered()
  
  // Game flow
  startQuiz()
  nextQuestion()
  endQuestion()
  showLeaderboard()
  endQuiz()
  
  // Answer handling
  submitAnswer(socketId, answerId, timestamp)
  
  // Timers
  startQuestionTimer()
  
  // Scoring
  updatePlayerScores(correctAnswerId)
  calculateLeaderboard()
  
  // Helpers
  broadcast(message)
  getCurrentQuestion()
  getState()
}
```

**Detailed Requirements for Each Method:**

**constructor:**
- Initialize game state
- Store quiz data
- Store settings (timers, etc.)
- Initialize player Map
- Initialize answer Map
- Set gameState to 'WAITING'

**addPlayer:**
- Add to players Map
- Broadcast updated player list
- Check if should auto-start (if autoStart && players >= minPlayers)
- Return success/failure

**submitAnswer:**
- Validate gameState === 'QUESTION'
- Validate player exists
- Validate not already answered
- Store answer with timestamp
- Broadcast answer count
- Check if all answered AND waitForAllPlayers → end early
- Return success/failure

**nextQuestion:**
- Increment question index
- Check if quiz ended (index >= questions.length) → endQuiz()
- Clear previous answers
- Set gameState = 'QUESTION'
- Broadcast NEW_QUESTION with question data + timeLimit
- Start question timer

**endQuestion:**
- Clear question timer
- Set gameState = 'ANSWER_REVEAL'
- Calculate correct answer
- Update player scores
- Calculate statistics
- Broadcast REVEAL_ANSWER
- Schedule showLeaderboard() after answerRevealTime

**Scoring Algorithm:**
```javascript
// Для правильної відповіді:
basePoints = 100
timeBonus = max(0, questionTime - answerTime) * 2
totalPoints = basePoints + timeBonus

// Для неправильної:
totalPoints = 0
```

**Ukrainian Comments - EXTENSIVE:**
Every function needs comments explaining:
- ЩО робить (what it does)
- КОЛИ викликається (when it's called)
- ЩО повертає (what it returns)
- ПОБІЧНІ ЕФЕКТИ (side effects like broadcasts)

Example:
```javascript
/**
 * Завершує поточне питання і показує правильну відповідь
 * 
 * Викликається автоматично коли:
 * - Закінчився таймер питання, АБО
 * - Всі гравці відповіли (якщо waitForAllPlayers = true)
 * 
 * Що робить:
 * 1. Зупиняє таймер питання
 * 2. Обчислює статистику відповідей
 * 3. Оновлює бали гравців
 * 4. Відправляє REVEAL_ANSWER всім клієнтам
 * 5. Планує показ leaderboard через N секунд
 * 
 * Побічні ефекти:
 * - Змінює gameState на 'ANSWER_REVEAL'
 * - Broadcast до всіх гравців
 * - Запускає таймер для showLeaderboard()
 */
endQuestion() {
  // Зупиняємо таймер щоб не спрацював двічі
  clearTimeout(this.questionTimer);
  
  // Змінюємо стан гри
  this.gameState = 'ANSWER_REVEAL';
  
  // ... detailed comments for EVERY line
}
```

#### Task 1.4: websocket-handler-auto.js

**File:** `backend/src/websocket-handler-auto.js`  
**Purpose:** Обробка всіх WebSocket подій

**Class Structure:**
```javascript
class QuizRoomManager {
  constructor(io)
  init()
  
  // Event handlers
  handleCreateQuiz(socket, data, callback)
  handleJoinQuiz(socket, data, callback)
  handleSubmitAnswer(socket, data, callback)
  handleDisconnect(socket)
  handleGetGameState(socket, data, callback)
  
  // Helpers
  generateRoomCode()
  cleanupOldSessions()
}
```

**Events to Handle:**

**Client → Server:**
- `create-quiz` - Host creates new quiz room
- `join-quiz` - Player joins with nickname + room code
- `submit-answer` - Player submits answer
- `get-game-state` - Get current state

**Server → Clients:**
- `quiz-update` - Broadcast state changes (with type field)

**Room Code Generation:**
- 6 characters
- Alphanumeric (A-Z, 0-9)
- Must be unique
- Easy to type on tablets

**Error Handling:**
Every callback must return:
```javascript
{
  success: true/false,
  error: "Descriptive error message" (if failed),
  data: {...} (if succeeded)
}
```

**Ukrainian Comments:**
- Explain WHY each validation exists
- Explain WHAT each broadcast does
- Explain WHEN to call each method

#### Task 1.5: Dummy Quiz Data

**Files:** `quizzes/dummy-quiz-1.json`, `quizzes/dummy-quiz-2.json`

**Purpose:** Тестові квізи для перевірки системи

**Requirements:**
- Simple, obvious questions
- 5-10 questions each
- Test different scenarios (easy, medium)
- Ukrainian questions OK

**Example:**
```json
{
  "title": "Тестовий квіз #1",
  "description": "Прості питання для перевірки системи",
  "questions": [
    {
      "question": "Скільки буде 2 + 2?",
      "answers": ["3", "4", "5", "22"],
      "correctAnswer": 1
    },
    {
      "question": "Якого кольору небо?",
      "answers": ["Червоне", "Зелене", "Блакитне", "Жовте"],
      "correctAnswer": 2
    }
    // ... 3-8 more questions
  ]
}
```

---

### BEFORE STARTING PHASE 1:

**Ask user:**
```
🎯 ГОТОВИЙ ПОЧАТИ PHASE 1: Core Automation

Phase 1 - це найважливіша частина проєкту.
Створимо автоматичну логіку гри.

⏱️ Очікуваний час: 4-6 годин роботи

📝 Що буде створено:
1. config.json - налаштування таймерів
2. server.js - головний сервер
3. quiz-session-auto.js - логіка гри (найважливіший файл!)
4. websocket-handler-auto.js - WebSocket події
5. Dummy quiz data - тестові квізи

💾 Commits:
- Після кожного файлу: mini-commit
- Після Phase 1: phase-1-complete commit + git tag

✅ Після завершення:
- Автоматичні тести
- Code review
- Performance check

Почати Phase 1? [Так/Показати більше деталей/Пауза]
```

---

### PHASE 2: Player Interface (CRITICAL)

**Estimated Time:** 3-5 hours  
**Priority:** CRITICAL

**Objectives:**
- Touch-friendly UI for tablets
- Real-time updates via Socket.IO
- 7 screen states
- Animations and visual feedback

#### Task 2.1: PlayerView.jsx

**File:** `frontend/src/components/PlayerView.jsx`

**State Machine (local):**
```
JOIN → WAITING → QUESTION → ANSWER_SENT → REVEAL → LEADERBOARD → ENDED
```

**React Hooks Needed:**
- useState for game state, questions, scores, etc.
- useEffect for Socket.IO listeners
- useEffect for timer countdown

**Socket Event Listeners:**
```javascript
socket.on('quiz-update', (data) => {
  // Handle different data.type:
  // - QUIZ_STARTING
  // - NEW_QUESTION
  // - ANSWER_COUNT
  // - REVEAL_ANSWER
  // - SHOW_LEADERBOARD
  // - QUIZ_ENDED
})
```

**7 Screens to Implement:**

1. **JOIN Screen** - Enter nickname + room code
2. **WAITING Screen** - Waiting for game start
3. **QUESTION Screen** - Show question + 4 answers + timer
4. **ANSWER_SENT Screen** - "Submitted, waiting..."
5. **REVEAL Screen** - Show if correct/wrong + score
6. **LEADERBOARD Screen** - Show position + score
7. **ENDED Screen** - Final results + "Play Again"

**Each screen needs:**
- Clean layout
- Large touch targets (100px+ height)
- Clear typography
- Visual feedback
- Appropriate colors/animations

#### Task 2.2: PlayerView.css

**File:** `frontend/src/components/PlayerView.css`

**Requirements:**
- Touch-optimized button sizes
- Responsive grid for answers (2 columns on tablets)
- Color coding:
  - Green for correct
  - Red for wrong
  - Purple for selected
- Timer bar animation
- Smooth transitions between states

**Key Classes:**
- `.player-view` - Container
- `.join-screen`, `.waiting-screen`, etc.
- `.answer-button` - Must be 100px+ tall
- `.timer-bar` - Visual countdown
- `.leaderboard-position` - Position display

#### Task 2.3: Frontend Build Setup

**File:** `frontend/package.json`

**Dependencies:**
- react
- react-dom
- socket.io-client

**Build Scripts:**
- `npm start` - Development server
- `npm run build` - Production build

---

### PHASE 3: Testing & Polish (HIGH Priority)

**Estimated Time:** 2-3 hours  
**Priority:** HIGH

**Objectives:**
- Verify system works end-to-end
- Test with multiple clients
- Performance validation
- Bug fixes

#### Task 3.1: Automated Tests

**Files:** 
- `backend/tests/session.test.js`
- `backend/tests/websocket.test.js`

**Test Coverage:**
- State transitions
- Answer validation
- Score calculation
- Timer accuracy
- Room code generation
- Player join/leave

#### Task 3.2: Manual Testing

**Scenarios:**
1. Single player game
2. Multi-player (2-3 clients)
3. Timer expiration
4. Early end (all answered)
5. Player disconnect mid-game
6. Config changes

#### Task 3.3: Performance Validation

**Metrics:**
- WebSocket latency < 100ms
- State transition < 500ms
- Memory usage < 50MB
- No memory leaks

---

### PHASE 4: Documentation (HIGH Priority)

**Estimated Time:** 1-2 hours  
**Priority:** HIGH

**Objectives:**
- Complete README
- API documentation
- Setup instructions
- Usage guide

#### Files to Complete:
- README.md - Full documentation
- API.md - WebSocket events documentation
- SETUP.md - Installation instructions
- USAGE.md - How to run quiz sessions

---

### PHASE 5: Optional Features (MEDIUM Priority)

**Estimated Time:** As needed  
**Priority:** MEDIUM

**Features:**
- Sound effects (correct/wrong/timeout)
- Admin panel for monitoring
- Quiz creator UI
- Statistics dashboard
- Question shuffle
- Team mode

**Only implement if time permits and user requests**

---

## 🎯 QUALITY CONTROLS

### Before Every Commit

**Run Checklist:**
1. ✅ Code review (self-review)
2. ✅ All comments in Ukrainian
3. ✅ No console.log() left in code
4. ✅ Proper error handling
5. ✅ Performance acceptable
6. ✅ Security validation

### Code Review Checklist

**For every file:**
```
✅ Ukrainian comments explain WHAT and WHY
✅ Function names are clear and descriptive
✅ Error handling for all async operations
✅ Input validation for all user data
✅ No hardcoded values (use config.json)
✅ Proper type checking
✅ Memory leaks prevented (timers cleared)
✅ WebSocket events have callbacks
✅ Logging for important events
✅ Performance: no unnecessary loops/operations
```

### Security Checklist

```
✅ All user input validated (nickname, room code, answers)
✅ Room codes are random and unpredictable
✅ No SQL injection possible (we don't use SQL, but still)
✅ No XSS possible in player names
✅ Rate limiting on answer submissions
✅ WebSocket connections authenticated
```

### Performance Checklist

```
✅ No blocking operations in main thread
✅ Timers cleared when not needed
✅ Players Map, not Array (O(1) lookup)
✅ Minimal data in WebSocket messages
✅ No memory leaks (all intervals cleared)
```

---

## 📊 PROGRESS TRACKING

### PROGRESS_LOG.md Updates

**Update AUTOMATICALLY after every major milestone:**

**After each file:**
```markdown
#### [TIMESTAMP] - Created [filename]
- Lines of code: [AUTO-COUNT]
- Functions: [AUTO-COUNT]
- Tests: [PASS/FAIL count]
- Status: ✅ Complete
```

**After each Phase:**
```markdown
### Phase [N] Complete - [TIMESTAMP]

**Duration:** [AUTO-CALCULATE from start to end]

**Files Created:**
- [filename] ([LOC] lines, [functions] functions)
- ...

**Tests:** [PASS]/[TOTAL]

**Commits:** [N] commits, [N] tags

**Next:** Phase [N+1]
```

### Visual Progress Tracker

**Update after every Phase:**
```markdown
## Visual Progress Tracker (Auto-updated)

```
Phase 0: System Setup        [██████████] 100% ✅
Phase 1: Core Automation     [████████░░]  80%
Phase 2: Player Interface    [░░░░░░░░░░]   0%
Phase 3: Testing & Polish    [░░░░░░░░░░]   0%
Phase 4: Documentation       [░░░░░░░░░░]   0%
Phase 5: Optional Features   [░░░░░░░░░░]   0%

Overall Progress: [████░░░░░░] 35%
```
```

### Session Summaries

**At end of each work session:**

```markdown
### Session [N] Summary - [DATE]

**Duration:** [HH:MM]
**Files Modified:** [N]
**Lines Added:** [+NNN]
**Lines Removed:** [-NN]

**Completed:**
- ✅ [Task description]
- ✅ [Task description]

**In Progress:**
- ⏳ [Task description]

**Blocked/Issues:**
- ❌ [Issue] → [Proposed solution]

**Next Session:**
- [ ] [Planned task]
- [ ] [Planned task]

**Notes:**
[Any important observations or decisions]
```

---

## 💬 COMMUNICATION PROTOCOLS

### When to Ask Permission

**ALWAYS ask before:**
1. Starting a new Phase
2. Major architectural decisions
3. Adding external dependencies
4. Changing API structure
5. Cannot resolve error after 3 attempts

**NEVER ask for:**
1. Code formatting choices (use standards)
2. Variable names (use clear, descriptive names)
3. File organization within structure (follow plan)
4. Comment style (use Ukrainian, be detailed)

### How to Report Progress

**After completing a file:**
```
✅ Створено: [filename]

📝 Що робить:
[1-2 sentence description in Ukrainian]

📊 Метрики:
- Рядків коду: [N]
- Функцій: [N]
- Коментарів: [N] (Ukrainian)

✅ Code review: Passed
✅ Tests: [N/N passing]

🔄 Commit: [commit hash]
```

**After completing a Phase:**
```
🎉 PHASE [N] ЗАВЕРШЕНО!

⏱️ Час: [duration]
📝 Файлів створено: [N]
✅ Тестів пройдено: [N/N]
🔄 Commits: [N]

🎯 Що зроблено:
- ✅ [Achievement]
- ✅ [Achievement]

📊 Статус проєкту: [XX]% завершено

🚀 Наступний крок: Phase [N+1]
[Brief description]

Продовжити? [Так/Показати деталі/Пауза]
```

### Error Reporting Format

**When encountering errors:**
```
⚠️ ПОМИЛКА

📍 Де: [filename:line]
🔴 Що: [Error message]

💡 Спроба #1: [What I tried]
❌ Результат: [Failed because...]

💡 Спроба #2: [Alternative approach]
❌ Результат: [Failed because...]

🤔 Можливі рішення:

Option A: [Solution description]
  ✅ Pros: [Benefits]
  ❌ Cons: [Drawbacks]
  
Option B: [Alternative solution]
  ✅ Pros: [Benefits]
  ❌ Cons: [Drawbacks]

💡 Рекомендую: Option [A/B]
Причина: [Explanation]

Продовжити з Option [X]? [Так/Спробувати Option Y/Обговорити]
```

### Daily Summary Format

**At end of work day:**
```
📅 DAILY SUMMARY - [DATE]

⏱️ Тривалість сесії: [HH:MM]

✅ ЗАВЕРШЕНО:
Phase [N]: [XX]% complete
- ✅ [Specific task]
- ✅ [Specific task]

🎯 МЕТРИКИ:
- Commits: [N]
- Files created: [N]
- Lines of code: [+NNN]
- Tests passing: [NN/NN]

💾 GitHub Status:
- Commits pushed: ✅
- Branch: main
- Last commit: [hash] - [message]

🐛 ISSUES:
- [None/Issue description]

📋 НАСТУПНА СЕСІЯ:
- [ ] [Planned task]
- [ ] [Planned task]

🎓 LEARNINGS:
- [New thing learned]

💡 NOTES:
[Any important observations]

---
Збережено в: PROGRESS_LOG.md
Git tag: session-[N]-complete
```

---

## 📚 TECHNICAL SPECIFICATIONS

### WebSocket Events Specification

**Complete reference for all events:**

#### Client → Server Events

**create-quiz**
```javascript
// Sent by: Host
// Purpose: Create new quiz room
{
  quizData: {
    title: string,
    questions: Array<Question>
  },
  settings: {
    questionTime: number,
    answerRevealTime: number,
    leaderboardTime: number,
    autoStart: boolean,
    waitForAllPlayers: boolean,
    minPlayers: number
  }
}

// Response:
{
  success: boolean,
  roomCode: string,    // 6-char code
  error?: string
}
```

**join-quiz**
```javascript
// Sent by: Player
// Purpose: Join existing quiz room
{
  roomCode: string,    // 6 chars, uppercase
  nickname: string     // 2-20 chars
}

// Response:
{
  success: boolean,
  message: string,
  nickname: string,
  roomCode: string,
  gameState: Object,
  error?: string
}
```

**submit-answer**
```javascript
// Sent by: Player
// Purpose: Submit answer to current question
{
  answerId: number     // 0-3 (index of answer)
}

// Response:
{
  success: boolean,
  error?: string
}
```

#### Server → Clients Events

**quiz-update**

Main event with different types:

**Type: QUIZ_STARTING**
```javascript
{
  type: 'QUIZ_STARTING',
  countdown: 3
}
```

**Type: NEW_QUESTION**
```javascript
{
  type: 'NEW_QUESTION',
  questionIndex: number,     // 1-based
  totalQuestions: number,
  question: {
    text: string,
    answers: [
      { id: 0, text: string },
      { id: 1, text: string },
      { id: 2, text: string },
      { id: 3, text: string }
    ]
  },
  timeLimit: number         // seconds
}
```

**Type: ANSWER_COUNT**
```javascript
{
  type: 'ANSWER_COUNT',
  answered: number,
  total: number
}
```

**Type: REVEAL_ANSWER**
```javascript
{
  type: 'REVEAL_ANSWER',
  correctAnswer: number,    // 0-3
  statistics: {
    total: number,
    answers: {
      0: { count: number, percentage: number },
      1: { count: number, percentage: number },
      2: { count: number, percentage: number },
      3: { count: number, percentage: number }
    }
  },
  playerResults: [
    {
      playerId: string,
      nickname: string,
      answerId: number,
      isCorrect: boolean,
      didNotAnswer: boolean
    }
  ]
}
```

**Type: SHOW_LEADERBOARD**
```javascript
{
  type: 'SHOW_LEADERBOARD',
  leaderboard: [
    {
      playerId: string,
      nickname: string,
      score: number,
      correctAnswers: number,
      totalQuestions: number,
      avgAnswerTime: number,
      position: number       // 1, 2, 3, etc.
    }
  ],
  questionIndex: number,
  totalQuestions: number,
  isLastQuestion: boolean
}
```

**Type: QUIZ_ENDED**
```javascript
{
  type: 'QUIZ_ENDED',
  finalLeaderboard: [/* same as SHOW_LEADERBOARD */],
  totalQuestions: number
}
```

---

### Scoring System Specification

**Formula:**
```javascript
if (answer is correct) {
  basePoints = 100
  timeBonus = max(0, questionTime - answerTime) * 2
  playerScore += basePoints + timeBonus
} else {
  // No points for wrong answer
  playerScore += 0
}
```

**Example:**
```
Question time limit: 30 seconds
Player answered in: 5 seconds
Calculation: 100 + (30 - 5) * 2 = 100 + 50 = 150 points
```

**Leaderboard Sorting:**
1. Primary: Total score (descending)
2. Tiebreaker: Average answer time (ascending - faster is better)

---

### State Machine Specification

**Complete state diagram:**

```
[START]
   ↓
WAITING
   ↓ (autoStart && players >= minPlayers) OR (manual start)
STARTING (3-second countdown)
   ↓
QUESTION
   ↓ (timer expires OR all answered)
ANSWER_REVEAL
   ↓ (after answerRevealTime seconds)
LEADERBOARD
   ↓ (after leaderboardTime seconds)
   ├─→ QUESTION (if more questions) [LOOP]
   └─→ ENDED (if no more questions)
```

**State Details:**

**WAITING:**
- Players can join
- No questions shown
- Waiting for start trigger

**STARTING:**
- Fixed 3-second countdown
- Players locked in
- No more joins allowed

**QUESTION:**
- Question displayed
- Timer running
- Accepting answers
- Can end early if all answered (if waitForAllPlayers)

**ANSWER_REVEAL:**
- Show correct answer
- Show player results (correct/wrong)
- Update scores
- Fixed duration (answerRevealTime)

**LEADERBOARD:**
- Show rankings
- Show scores
- Fixed duration (leaderboardTime)

**ENDED:**
- Final rankings
- Game over
- Players can leave

---

### Timer Configuration

**All timers are configurable in config.json:**

```javascript
questionTime: 10-120 seconds (default: 30)
  // How long players have to answer

answerRevealTime: 2-15 seconds (default: 5)
  // How long to show correct answer

leaderboardTime: 2-15 seconds (default: 5)
  // How long to show rankings
```

**Timer Implementation:**
- Use `setTimeout()` for all timers
- Always clear timers on state change
- Store timer references for cleanup
- Never let timers run indefinitely

---

### Git Workflow

**Commits:**

After each significant file:
```bash
git add [filename]
git commit -m "feat: add [description]

[Detailed description in English]
[What was implemented]
[Why it was needed]"
git push origin main
```

**After each Phase:**
```bash
# Commit all changes
git add .
git commit -m "feat: complete Phase [N] - [Title]

Phase [N] implementation including:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Tests: [N/N passing]
Documentation: Updated"

# Create tag
git tag -a phase-[N]-complete -m "Phase [N]: [Title] - Complete

Duration: [time]
Files: [N]
Tests: [N/N]"

# Push with tags
git push origin main --tags
```

**Commit Message Format:**
```
<type>: <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `test`: Tests
- `refactor`: Code refactoring
- `style`: Code style
- `chore`: Maintenance

---

### File Header Template

**Every file should start with:**

```javascript
/**
 * Quiz Room Auto - [Module Name]
 * 
 * Опис (Ukrainian):
 * [What this file does - detailed explanation]
 * 
 * Відповідальність (Responsibilities):
 * - [Responsibility 1]
 * - [Responsibility 2]
 * 
 * Використання (Usage):
 * [How this module is used]
 * 
 * @module [module-name]
 * @author EduardIng
 * @created [DATE]
 * @modified [DATE]
 */
```

**Example:**
```javascript
/**
 * Quiz Room Auto - WebSocket Handler
 * 
 * Опис (Ukrainian):
 * Обробляє всі WebSocket події між клієнтами (планшетами) та сервером.
 * Керує створенням кімнат, приєднанням гравців, відправкою відповідей.
 * 
 * Відповідальність (Responsibilities):
 * - Створення нових quiz кімнат
 * - Обробка приєднання гравців
 * - Маршрутизація відповідей до AutoQuizSession
 * - Генерація унікальних кодів кімнат
 * - Очищення старих сесій
 * 
 * Використання (Usage):
 * const manager = new QuizRoomManager(io);
 * manager.init();
 * 
 * @module websocket-handler-auto
 * @author EduardIng
 * @created 2026-03-04
 * @modified 2026-03-04
 */
```

---

## 🚨 EMERGENCY PROCEDURES

### Emergency Stop

**If user says "EMERGENCY STOP" or "СТОП ЗАРАЗ":**

1. **Immediately stop** current operation
2. **Save** all work in progress (even if incomplete)
3. **Commit** with message "WIP: Emergency stop at [description]"
4. **Create** EMERGENCY_BACKUP.md with exact state
5. **Report** to user:

```
🚨 EMERGENCY STOP ACTIVATED

📍 Зупинено на:
File: [current file]
Line: [approximate line]
Function: [current function]

💾 Збережено:
- Emergency commit: [hash]
- Backup file: EMERGENCY_BACKUP.md

📊 Статус:
Phase [N]: [XX]% complete
Last complete file: [filename]

🔄 Як продовжити:
Напиши "продовжуй" і я відновлю роботу з точного місця.

Альтернативно:
- "rollback" - відкотитись до останнього phase commit
- "status" - показати детальний статус
```

### Rollback Procedure

**If user says "rollback":**

```bash
# Show available tags
git tag -l

# Ask user which point to rollback to
```

```
🔄 ROLLBACK OPTIONS

Доступні checkpoint'и:

1. phase-1-complete (2 години тому)
   ✅ Core automation working
   
2. phase-0-complete (3 години тому)
   ✅ Project setup complete

3. init (3 години тому)
   ⚠️ Empty project

Відкотитись до якого checkpoint? [1/2/3/Відміна]
```

### Pause and Resume

**If user says "pause" or "зупинись":**

1. **Complete** current file/function
2. **Commit** changes
3. **Update** PROGRESS_LOG.md
4. **Show** resume instructions

```
⏸️ ПАУЗА

✅ Збережено:
- Поточний файл завершено
- Commit: [hash]
- Progress log оновлено

📊 Статус:
Phase [N]: [XX]% complete
Наступне завдання: [description]

⏱️ Estimated time remaining: [time]

🔄 Як продовжити:
Напиши "продовжуй" і я продовжу з наступного завдання.
```

---

## ✅ FINAL CHECKLIST

**Before declaring project complete:**

### Functionality
- [ ] Server starts without errors
- [ ] Config loads and validates
- [ ] Quiz rooms can be created
- [ ] Players can join with code
- [ ] Questions display automatically
- [ ] Timer works correctly
- [ ] Answers can be submitted
- [ ] Scores calculate correctly
- [ ] Leaderboard displays
- [ ] Game ends properly
- [ ] Multiple games work sequentially

### Code Quality
- [ ] All functions have Ukrainian comments
- [ ] No console.log() in production code
- [ ] Error handling everywhere
- [ ] Input validation complete
- [ ] No hardcoded values
- [ ] Memory leaks prevented
- [ ] Code reviewed

### Testing
- [ ] Automated tests pass
- [ ] Manual testing completed
- [ ] Multi-player tested
- [ ] Timer accuracy verified
- [ ] Disconnect handling works

### Documentation
- [ ] README.md complete
- [ ] PROGRESS_LOG.md updated
- [ ] GLOSSARY.md filled
- [ ] API documentation done
- [ ] Setup instructions clear

### Git
- [ ] All commits pushed
- [ ] All phases tagged
- [ ] Clean commit history
- [ ] .gitignore correct

### Performance
- [ ] Latency < 100ms
- [ ] Memory < 50MB
- [ ] No blocking operations
- [ ] Timers cleanup properly

---

## 🎉 SUCCESS CRITERIA

**Project is complete when:**

1. ✅ All phases finished
2. ✅ All tests passing
3. ✅ Documentation complete
4. ✅ User can run quiz with 2+ clients
5. ✅ Questions advance automatically
6. ✅ Timers configurable
7. ✅ Code reviewed and clean
8. ✅ GitHub repository complete

**Final message:**
```
🎉🎉🎉 ПРОЄКТ ЗАВЕРШЕНО! 🎉🎉🎉

✅ Quiz Room Auto v1.0 готовий до використання!

📊 Статистика:
- Фаз завершено: 5/5
- Файлів створено: [N]
- Рядків коду: [N]
- Тестів пройдено: [N/N]
- Commits: [N]
- Тривалість: [total time]

🚀 Що тепер:
1. Запусти сервер: npm start
2. Відкрий на планшетах: http://[твій-IP]:8080
3. Створи кімнату на MacBook
4. Приєднайся з планшетів
5. Гра автоматично стартує!

📚 Документація:
- README.md - повна інструкція
- QUICK_START.md - швидкий старт
- GLOSSARY.md - технічні терміни

🔗 GitHub: https://github.com/EduardIng/quiz-room-auto

🎓 Наступні кроки:
- Додай реальні квізи (замість dummy)
- Протестуй з 8 планшетами
- Додай звуки (optional)
- Налаштуй планшети в kiosk mode

💡 Потрібна допомога? Дивись:
- KNOWN_ISSUES.md - відомі проблеми
- LEARNING_NOTES.md - корисні поради

ВІТАЮ! Проєкт готовий! 🎊
```

---

## 📞 CONTACT & SUPPORT

**If stuck or need clarification:**

User can:
1. Say "pause" - detailed pause with resume info
2. Say "help" - show available commands
3. Say "explain [term]" - detailed explanation
4. Say "status" - current progress
5. Ask any question - get detailed Ukrainian explanation

**Your response format:**
- Always in Ukrainian for explanations
- Technical details can be in English
- Code comments in Ukrainian
- Be patient and thorough

---

**END OF INSTRUCTION**

**You are ready to begin! Start with Phase 0 setup and ask user for confirmation before proceeding to Phase 1.**

**Remember:**
- 🇺🇦 Ukrainian explanations
- 💬 Ask before each Phase
- 📝 Extensive code comments
- ✅ Code review before commit
- 🔄 Auto-update progress log
- 🚀 Automation where possible, questions when uncertain

**Good luck! Let's build an amazing quiz system! 🎮**

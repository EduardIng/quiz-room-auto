# Quiz Room Auto 🎮

> Automated quiz room system for commercial venues — no host required after setup

[![Tests](https://img.shields.io/badge/tests-66%20passed-brightgreen)](backend/tests/)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](package.json)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## Current Status
```
Phase 0: System Setup        [██████████] 100% ✅
Phase 1: Core Automation     [██████████] 100% ✅
Phase 2: Player Interface    [██████████] 100% ✅
Phase 3: Testing & Polish    [██████████] 100% ✅
Phase 4: Documentation       [██████████] 100% ✅
Phase 5: Optional Features   [░░░░░░░░░░]   0%
```
Last Updated: 2026-03-05

---

## What is this?

**Quiz Room Auto** is a self-running quiz system designed for bars, restaurants, and event venues. Once a quiz is started, the system automatically advances through questions, reveals answers, shows leaderboards, and ends the game — no host clicking required.

**How it works:**
1. Host opens the web UI and loads a quiz → a 6-character room code is generated
2. Players join on their phones/tablets by entering the room code + a nickname
3. The quiz runs automatically: questions → timer → answer reveal → leaderboard → repeat
4. Final results are shown at the end

---

## Quick Start

### 1. Install dependencies
```bash
cd quiz-room-auto
npm install
cd frontend && npm install && cd ..
```

### 2. Build frontend
```bash
npm run build:frontend
```

### 3. Start the server
```bash
npm start
```

### 4. Open in browser
```
http://localhost:8080
```

Players on the same network connect via:
```
http://10.0.1.36:8080   ← your local IP shown in terminal on startup
```

---

## Documentation

| File | Description |
|------|-------------|
| [SETUP.md](SETUP.md) | Full installation & configuration guide |
| [USAGE.md](USAGE.md) | How to create and run quiz sessions |
| [API.md](API.md) | WebSocket events reference |
| [PROGRESS_LOG.md](PROGRESS_LOG.md) | Development history |
| [GLOSSARY.md](GLOSSARY.md) | Technical terms in Ukrainian |
| [DECISIONS.md](DECISIONS.md) | Architecture decisions |
| [KNOWN_ISSUES.md](KNOWN_ISSUES.md) | Known issues & workarounds |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 25, Express 4, Socket.IO 4 |
| Frontend | React 18, Vite 4 |
| Real-time | WebSocket (Socket.IO) |
| Testing | Jest 29 (66 tests) |

---

## Project Structure

```
quiz-room-auto/
├── backend/
│   ├── src/
│   │   ├── server.js                  # Express + Socket.IO server
│   │   ├── quiz-session-auto.js       # State machine (core logic)
│   │   ├── websocket-handler-auto.js  # WebSocket event handlers
│   │   ├── quiz-storage.js            # Load quizzes from disk
│   │   └── utils.js                   # Config loader, logging
│   └── tests/
│       ├── session.test.js            # 44 unit tests
│       └── websocket.test.js          # 22 unit tests
├── frontend/
│   ├── src/
│   │   ├── components/PlayerView.jsx  # 7-screen player UI
│   │   └── styles/theme.css           # Dark theme variables
│   └── public/                        # Static assets
├── quizzes/
│   ├── dummy-quiz-1.json              # Sample: general knowledge
│   └── dummy-quiz-2.json              # Sample: technology
├── config.json                        # All timers & settings
└── package.json
```

---

## Configuration

Edit `config.json` to change game behaviour:

```json
{
  "server": {
    "port": 8080,
    "host": "0.0.0.0"
  },
  "quiz": {
    "questionTime": 30,        // seconds per question
    "answerRevealTime": 5,     // seconds to show correct answer
    "leaderboardTime": 5,      // seconds to show rankings
    "autoStart": true,         // start when minPlayers join
    "waitForAllPlayers": true, // end question early if all answered
    "minPlayers": 1,
    "maxPlayers": 8
  }
}
```

---

## Running Tests

```bash
npm test
```

Output: `66 passed, 0 failed`

---

## License

Based on [Quiz Mate](https://github.com/david-04/quiz-mate) (ISC License).
Additions by EduardIng — MIT License.

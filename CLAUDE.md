# ІНСТРУКЦІЯ ДЛЯ CLAUDE CODE - Quiz Room Automation Project

**Project Name:** quiz-room-auto
**Developer:** EduardIng
**Target:** Commercial quiz room system with automatic question progression
**Base:** Quiz Mate (https://github.com/david-04/quiz-mate)
**Version:** 1.3.0
**Date:** March 4, 2026

---

## STARTING A NEW SESSION

**Always read both files before doing anything:**
1. This file (CLAUDE.md) — behavioral rules, architecture, full API/event reference
2. `PROGRESS.md` — complete implementation journal, pending items, session history

**Quick start commands:**
```bash
npm start                  # backend on port 8080 (production / testing)
cd frontend && npm run dev # frontend dev server on port 5173 (Vite HMR)
npm test                   # run all 165 tests
```

**Tech stack:** Node.js + Express + Socket.IO (backend) | React + Vite + hash routing (frontend) | SQLite via better-sqlite3 (DB)

---

## PERMANENT PERMISSIONS (updated 7 March 2026)

All of the following are **pre-authorized and require zero confirmation**:

- `git commit`, `git push`, `git push --tags`, `git tag`
- Creating, editing, or deleting any file in this project
- `npm install`, `npm run build`, `npm test`
- Starting new features, phases, or refactors autonomously
- Updating PROGRESS.md, CLAUDE.md, and memory files at `/Users/einhorn/.claude/projects/…/memory/`
- Making architectural and implementation decisions using best judgment
- Choosing between libraries, patterns, or approaches without asking

**Only stop and check with the user when:**
1. **Product ambiguity** — the requirement is genuinely unclear (not *how* to build, but *what* to build).
2. **Breaking change to stored data** — a migration would alter or destroy data in `sessions.db` or `quizzes/` irreversibly.
3. **Breaking API contract** — a change would require all connected clients to reload simultaneously, breaking a live event.
4. **External paid service** — any action calling a paid third-party API, sending email/SMS, or requiring new credentials.
5. **Force-destructive git** — `git push --force` to `main`, `git reset --hard` on pushed commits, or deleting remote branches.
6. **Scope is genuinely unclear** — state the interpretations, pick the most commercially sensible one, proceed — only stop if proceeding would cause problem 2 or 3.

**When multiple valid technical solutions exist:** Do NOT ask. Assess silently using the ARCHITECTURE ASSESSMENT criteria, pick the best, note the decision in one sentence in the commit message or PROGRESS.md.

---

## ARCHITECTURE ASSESSMENT (for commercial product)

This is a **commercial system** used at live events. When choosing among implementations, evaluate against these criteria in order:

1. **Live-event safety** — does this change risk breaking an in-progress game? Prefer additive changes over modifications to the state machine core.
2. **Backwards compatibility** — new quiz JSON fields must be optional with sensible defaults so existing `quizzes/*.json` files keep working.
3. **Scalability headroom** — prefer solutions that work for 2 players and for 50 players without rewriting. Avoid hardcoded limits or O(n^2) loops.
4. **Operability** — the host is a non-technical user. Prefer zero config changes, zero server restarts, zero manual steps.
5. **Testability** — pure functions and isolated modules. Every new server-side behaviour should be unit-testable without running a real socket.
6. **Maintainability** — future Claude sessions must understand the code from comments alone. Ukrainian comments, clear state machine transitions, no magic numbers.

When these criteria conflict: **live-event safety > backwards compatibility > scalability > the rest**.

---

## CRITICAL RULES

### Communication Language
- **Primary language:** Ukrainian (all explanations to user)
- **Code comments:** Ukrainian (extensive, explain WHAT and WHY for every function)
- **Git commits:** English (industry standard)
- **Documentation:** English (README, API docs)

### Automation Level
- **Fully automatic** — proceed without asking per PERMANENT PERMISSIONS above.
- Never ask "should I continue?" or "shall I proceed?" between steps.
- When multiple solutions exist: assess silently, pick best, proceed.

### Before Asking User (when genuinely required)
1. Clear explanation of the situation (Ukrainian)
2. Exactly what decision only the user can make
3. Your recommended default if the user says nothing

### Error Handling
1. Try to fix automatically (2-3 alternative approaches)
2. If cannot fix: show error + proposed solution + ask confirmation
3. Never proceed with broken code

### Code Quality Standards
- Extensive Ukrainian comments explaining WHAT and WHY
- Code review before every commit
- Performance check before merge
- Security validation for all user inputs

---

## SYSTEM VERIFICATION

**Already verified:** Node.js v25.6.0, npm v11.8.0, macOS 26.2 (Sequoia), git, GitHub connectivity, port 8080 available.

If recheck needed:
```bash
git --version && node --version && npm --version
ping -c 1 github.com
git ls-remote https://github.com/david-04/quiz-mate.git
```

---

## GITHUB SETUP

**Already complete.**

```
Username: EduardIng
Repository: https://github.com/EduardIng/quiz-room-auto
Local: /Users/einhorn/quiz-room-auto
Branch: main
```

Git config:
```bash
git config --global user.name "EduardIng"
git config --global user.email "eduarding@users.noreply.github.com"
```

---

## PROJECT STRUCTURE

```
quiz-room-auto/
├── backend/
│   ├── src/
│   │   ├── server.js                  <- Express server, static, API endpoints
│   │   ├── websocket-handler-auto.js  <- Socket.IO all WS events
│   │   ├── quiz-session-auto.js       <- State machine for one quiz session
│   │   ├── quiz-storage.js            <- Load/save quizzes from quizzes/
│   │   ├── db.js                      <- SQLite (better-sqlite3)
│   │   └── utils.js                   <- Logging, validation
│   └── tests/
│       ├── session.test.js            <- 70 tests
│       └── websocket.test.js          <- 30 tests
├── frontend/
│   ├── src/
│   │   ├── main.jsx                   <- Routing (#/, #/admin, #/create, #/stats, #/screen)
│   │   ├── components/
│   │   │   ├── PlayerView.jsx         <- Player UI (10 screens)
│   │   │   ├── AdminPanel.jsx         <- Live room monitoring
│   │   │   ├── QuizCreator.jsx        <- Visual quiz editor + host controls
│   │   │   ├── ProjectorView.jsx      <- Big screen for venue (#/screen)
│   │   │   └── StatsPanel.jsx         <- Session statistics
│   │   ├── styles/theme.css
│   │   └── utils/
│   │       ├── i18n.js                <- UK/EN translations
│   │       ├── useLang.js             <- React hook, localStorage
│   │       └── sound.js               <- Web Audio API (synthetic sounds)
│   ├── index.html, vite.config.js, package.json
├── quizzes/                           <- JSON quizzes (standard + category mode)
├── quiz creation/                     <- quiz-mega-pack.json, quiz-mega-pack-v2.json
├── data/sessions.db                   <- SQLite (auto-created)
├── RESTART/YAK_ZAPUSTYTY_PROEKT.md
├── config.json
├── package.json
├── PROGRESS.md                        <- Primary development journal
└── README.md, API.md, SETUP.md, USAGE.md, DECISIONS.md, KNOWN_ISSUES.md, GLOSSARY.md
```

---

## IMPLEMENTATION PHASES (all complete as of v1.3.0)

### Phase 1 — Core Backend

**State Machine:** `WAITING -> STARTING -> QUESTION -> ANSWER_REVEAL -> LEADERBOARD -> (repeat) -> ENDED`

**`AutoQuizSession`** (`quiz-session-auto.js`):
- `addPlayer(socketId, nickname)` — add to players Map, auto-start check
- `removePlayer(socketId)` — cleanup, chooser adjustment, auto-resolve if chooser left
- `startQuiz()` — 3s countdown, then `startCategorySelect()` or `nextQuestion()`
- `nextQuestion()` — increment index, build question obj, broadcast NEW_QUESTION, start timer
- `endQuestion()` — stop timer, calc stats, update scores, broadcast REVEAL_ANSWER, schedule leaderboard
- `showLeaderboard()` — broadcast SHOW_LEADERBOARD, schedule next question or endQuiz
- `submitAnswer(socketId, answerId, timestamp)` — validate state/player/duplicate, store, check early end
- `pauseGame()` — stop timer, save `questionTimeRemaining`, broadcast GAME_PAUSED
- `resumeGame()` — restore timer from `questionTimeRemaining`, correct `questionStartTime`, broadcast GAME_RESUMED
- `skipQuestion()` — handles all states: QUESTION->endQuestion, ANSWER_REVEAL->leaderboard, LEADERBOARD->next/end, CATEGORY_SELECT->auto-resolve
- `forceStart()` — start from WAITING
- `startCategorySelect()` — set state, pick chooser by rotation, broadcast CATEGORY_SELECT, start 15s timer
- `submitCategory(socketId, choiceIndex)` — validate, cancel timer, call `_resolveCategory`
- `_resolveCategory(roundIndex, choiceIndex, wasTimeout)` — build question from chosen option, broadcast CATEGORY_CHOSEN, after 1s call nextQuestion
- `getState()` — full snapshot: `isPaused`, `timeRemaining`, `timeLimit`, `currentQuestion` (no correct answer), `correctAnswer` (only in ANSWER_REVEAL), `leaderboard` (LEADERBOARD/ENDED)

**`QuizRoomManager`** (`websocket-handler-auto.js`):
- Events: `create-quiz`, `join-quiz`, `submit-answer`, `submit-category`, `get-game-state`, `watch-room`, `host-control`, `disconnect`
- Rate limiting: `answerRateLimit` Map, max 10 `submit-answer` per 30s per socket
- Auth: `roomHosts.get(roomCode) === socket.id` for host-control
- Room code: 6 uppercase alphanumeric, unique
- `handleDisconnect` cleans: observers, answerRateLimit, roomHosts

**Scoring:**
```
basePoints = 100
timeBonus = max(0, questionTime - answerTime) * 2
playerScore += basePoints + timeBonus   // 0 for wrong
Tiebreaker: avgAnswerTime ascending
```

### Phase 2 — Frontend

**PlayerView screens:** join -> waiting -> starting -> question -> answer_sent -> reveal -> leaderboard -> ended -> category_select -> category_chosen

**Key patterns:**
- Socket listener via `handleServerUpdateRef` + `questionRef` (ref pattern to avoid stale closures — critical bug fix in Phase 9)
- Touch buttons 100px+ height, 2-column answer grid on tablets
- Colors: green=correct, red=wrong, purple=selected
- Timer bar animation, smooth state transitions
- `?room=XXXXX` URL param auto-fills room code

### Phase 3 — Tests (165/165)
- `session.test.js` — 70 tests: states, players, scores, leaderboard, host controls, pause/resume/skip, category mode
- `websocket.test.js` — 30 tests: rooms, join, answers, disconnect, watch-room, host-control, saveQuiz/deleteQuiz
- `quiz-storage.test.js` — 28 tests: loadAllQuizzes, saveQuiz, deleteQuiz, loadQuizById, path traversal protection
- `db.test.js` — 22 tests: saveSession, getSessions, getSessionResults, getStats, cleanupOldSessions, cascade delete
- `server.test.js` — 15 tests: all HTTP endpoints via supertest (health, quizzes, stats, qr)

### Phase 4 — Documentation
README.md, SETUP.md, USAGE.md, API.md, DECISIONS.md, KNOWN_ISSUES.md, GLOSSARY.md — complete for v1.3.0.

### Phase 5 — Optional Features
- Question shuffle (Fisher-Yates, `config.json "shuffle": true`)
- Sound effects (Web Audio API, synthetic, no audio files)
- Admin Panel (`#/admin`) — live room monitoring
- Quiz Creator (`#/create`) — visual editor with drag-to-reorder (handle icon)

### Phase 6 — Advanced Features
- SQLite (`db.js`): tables `sessions`, `results`, `question_stats`, auto-save on quiz end
- QR codes: `GET /api/qr/:roomCode` -> PNG 200x200
- StatsPanel (`#/stats`): aggregated stats, sessions table, expandable leaderboard
- i18n UK/EN: `i18n.js` + `useLang.js` hook, localStorage
- Quiz import: file upload + library list

### Phase 7 — Media Questions
- Image: `"image": "url"` field, shown above question text (max 220px)
- Audio: `"audio": "url"` field, autoplay on question + replay button + stop on reveal
- Drag-to-reorder in QuizCreator

### Phase 8 — Category Mode

**Category quiz JSON format:**
```json
{
  "title": "...",
  "categoryMode": true,
  "rounds": [{
    "options": [
      { "category": "Geography", "question": "...", "answers": ["","","",""], "correctAnswer": 0 },
      { "category": "History",   "question": "...", "answers": ["","","",""], "correctAnswer": 2 }
    ]
  }]
}
```

- Chooser rotates via `playerJoinOrder`, 15s timeout, auto-resolve on disconnect
- Standard fields must be optional/backward compatible

### Phase 9 — Quiz Library + Bug Fix
- `saveQuiz(quizData)` — saves to `quizzes/`, auto-increments filename on collision
- `deleteQuiz(quizId)` — path traversal protected
- `POST /api/quizzes/save` / `DELETE /api/quizzes/:id`
- **Critical stale closure bug fixed:** `handleServerUpdateRef` + `questionRef` pattern in PlayerView

### Phase 10 — Projector View + Host Controls
- **ProjectorView** (`#/screen`): `watch-room` observer, auto-sync via `getState()`, all game screens, pause overlay, QR display
- **Host Controls** in QuizCreator: Start/Pause/Resume/Skip buttons, GAME_PAUSED/GAME_RESUMED listeners
- **Rate limiting:** 10 submit-answer per 30s per socket
- **DB cleanup:** `cleanupOldSessions(90)` on startup + every 24h

---

## config.json (current values)

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

Timer ranges: `questionTime` 10-120s, `answerRevealTime` 2-15s, `leaderboardTime` 2-15s. Validated on load, sensible defaults.

---

## WebSocket Events (Complete Reference)

### Client -> Server

| Event | Data | Response |
|-------|------|----------|
| `create-quiz` | `{ quizData, settings }` | `{ success, roomCode }` |
| `join-quiz` | `{ roomCode, nickname }` | `{ success, gameState, nickname }` |
| `submit-answer` | `{ answerId: 0-3 }` | `{ success }` |
| `submit-category` | `{ choiceIndex: 0-1 }` | `{ success }` |
| `get-game-state` | `{ roomCode }` | `{ success, gameState }` |
| `watch-room` | `{ roomCode }` | `{ success, gameState }` |
| `host-control` | `{ roomCode, action: 'pause'|'resume'|'skip'|'start' }` | `{ success }` |

### Server -> Client (`quiz-update` types)

| type | When | Key fields |
|------|------|------------|
| `PLAYER_JOINED` | Someone joined | `players`, `totalPlayers` |
| `PLAYER_LEFT` | Someone disconnected | `nickname`, `players` |
| `QUIZ_STARTING` | Start countdown | `countdown: 3`, `totalQuestions` |
| `CATEGORY_SELECT` | Before question (category) | `chooserNickname`, `options [{index, category}]`, `roundIndex`, `totalRounds`, `timeLimit` |
| `CATEGORY_CHOSEN` | Category selected | `category`, `choiceIndex`, `wasTimeout` |
| `NEW_QUESTION` | New question | `questionIndex`, `totalQuestions`, `question {text, answers, image?, audio?}`, `timeLimit` |
| `ANSWER_COUNT` | Someone answered | `answered`, `total` |
| `GAME_PAUSED` | Host paused | `timeRemaining` |
| `GAME_RESUMED` | Host resumed | `timeRemaining` |
| `REVEAL_ANSWER` | Timer up / all answered | `correctAnswer`, `statistics`, `playerResults` |
| `SHOW_LEADERBOARD` | After reveal | `leaderboard`, `isLastQuestion` |
| `QUIZ_ENDED` | After last leaderboard | `finalLeaderboard`, `totalQuestions` |

---

## HTTP API

| Method | Path | Returns |
|--------|------|---------|
| GET | `/health` | `{ status, uptime, activeSessions }` |
| GET | `/api/active-quizzes` | Active rooms list |
| GET | `/api/quizzes` | Quiz list from quizzes/ (standard + categoryMode) |
| POST | `/api/quizzes/save` | Save quiz -> `{ id, filename }` |
| DELETE | `/api/quizzes/:id` | Delete quiz file |
| GET | `/api/stats` | Aggregated stats + sessions list |
| GET | `/api/stats/session/:id` | Single session details |
| GET | `/api/qr/:roomCode` | PNG QR code 200x200 |

---

## QUALITY CONTROLS

### Before Every Commit
```
- Self code review passed
- Ukrainian comments explain WHAT and WHY for every function
- No console.log() in production code
- Error handling for all async operations
- Input validation for all user data
- No hardcoded values (use config.json)
- Memory leaks prevented (all timers/intervals cleared on state change)
- WebSocket event callbacks return { success, error?, data? }
- Performance: Players stored as Map (O(1) lookup), no O(n^2) loops
```

### Security Checklist
```
- All user input validated (nickname 2-20 chars, roomCode 6 chars, answerId 0-3)
- Room codes random and unpredictable (Math.random alphanumeric)
- No XSS in player names (sanitize before broadcast)
- Rate limiting on submit-answer (10 per 30s per socket)
- Host-control authenticated (roomHosts Map)
- Path traversal protection in quiz save/delete
```

---

## PROGRESS TRACKING

Two files, two levels of detail — both must be updated:

### PROGRESS_LOG.md — detailed per-file log
Update after **every file created or significantly modified**. Entry format:

```
#### [YYYY-MM-DD HH:MM] — [filename]
- Lines of code: N
- Functions added: N
- Tests: N/N passing
- What changed: [bullet list of every meaningful change — methods added,
  bugs fixed, fields added, events wired, etc.]
- Build size (frontend only): NNN KB JS + NN KB CSS
- Commit: [hash]
```

Also add a session header when starting a new session:
```
### Session N — YYYY-MM-DD
**Goal:** [what this session aims to complete]
```

And a session summary at the end:
```
**Session N complete** — Duration: HH:MM | Files: N | Tests: N/N | Commits: N
```

### PROGRESS.md — phase-level summary
Update after **every completed phase**. Keep the existing format: what the phase did overall, list of implemented features, key architectural decisions. No per-file detail — that lives in PROGRESS_LOG.md.

Also update the visual tracker in PROGRESS.md after each phase:
```
Phase 0: System Setup        [##########] 100%
Phase N: Feature             [####------]  40%
Overall:                     [######----]  60%
```

---

## COMMUNICATION PROTOCOLS

### When to Ask
**Ask before:** major architectural decisions, adding external dependencies, changing API structure, cannot resolve error after 3 attempts.

**Never ask:** code formatting, variable names, file organization, comment style.

### Progress Report Format
```
Created: [filename] | LOC: N | Functions: N | Tests: N/N | Commit: [hash]
```

### Error Report Format
```
ERROR: [file:line] -- [message]
Attempt 1: [tried] -> failed: [reason]
Attempt 2: [tried] -> failed: [reason]
Option A: [solution] Pros: [...] Cons: [...]
Option B: [solution] Pros: [...] Cons: [...]
Recommend: Option X -- [reason]
```

---

## TECHNICAL SPECIFICATIONS

### State Machine

```
Standard:  WAITING -> STARTING -> QUESTION -> ANSWER_REVEAL -> LEADERBOARD -> (repeat) -> ENDED
Category:  WAITING -> STARTING -> CATEGORY_SELECT -> [1s CATEGORY_CHOSEN] -> QUESTION -> ...
```

State rules:
- **WAITING** — players can join, waiting for start trigger
- **STARTING** — 3s countdown, no more joins allowed
- **CATEGORY_SELECT** — chooser picks, 15s timeout, auto-resolve if chooser disconnects
- **QUESTION** — timer running, accepting answers, early end if all answered + `waitForAllPlayers`
- **ANSWER_REVEAL** — show correct, update scores, fixed `answerRevealTime` duration
- **LEADERBOARD** — show rankings, fixed `leaderboardTime`, then next question or endQuiz
- **ENDED** — final rankings, game over

### Git Workflow

After each file:
```bash
git add [filename]
git commit -m "feat: add [description]"
git push origin main
```

After each Phase:
```bash
git add .
git commit -m "feat: complete Phase N - Title"
git tag -a phase-N-complete -m "Phase N: Title -- Complete"
git push origin main --tags
```

Commit types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`

### File Header Template
```javascript
/**
 * Quiz Room Auto - [Module Name]
 *
 * Опис: [What this file does — Ukrainian description]
 *
 * Відповідальність:
 * - [Responsibility 1]
 * - [Responsibility 2]
 *
 * Використання: [How this module is used]
 *
 * @module [module-name]
 * @author EduardIng
 * @created [DATE]
 * @modified [DATE]
 */
```

---

## EMERGENCY PROCEDURES

### Emergency Stop ("EMERGENCY STOP" / "СТОП ЗАРАЗ")
1. Stop immediately
2. Commit: `"WIP: Emergency stop at [description]"`
3. Create `EMERGENCY_BACKUP.md` with exact current state
4. Report: stopped at file/function, commit hash, phase completion %, how to resume

### Rollback
```bash
git tag -l   # show available checkpoints
# Present options to user, wait for choice
```

Available tags: `phase-1-complete` through `phase-5-complete`, `v1.1.0`, `v1.2.0`, `v1.3.0`

### Pause ("pause" / "зупинись")
1. Complete current file/function
2. Commit + update PROGRESS.md
3. Report: commit hash, next planned task, say "write 'continue' to resume"

---

## Versions & Tags

| Tag | Content |
|-----|---------|
| `v1.0.0` | Phase 0-5: base system + shuffle + sounds + admin + creator |
| `v1.1.0` | Phase 6: SQLite + QR + stats + i18n + import |
| `v1.2.0` | Phase 7: image/audio questions + drag-to-reorder |
| `v1.3.0` | Phase 8-10: Category Mode + Quiz Library + Projector + Host Controls |

---

## Known Issues

| ID | Issue |
|----|-------|
| KI-001 | QR code encodes IP at creation time — stale if server IP changes |
| KI-002 | `better-sqlite3` requires `node-gyp` to build from source |
| KI-003 | StatsPanel makes a separate request per expanded session row |
| KI-004 | Language preference stored separately per browser/device |

---

## Support Commands

- `"pause"` / `"зупинись"` — safe pause with resume info
- `"status"` — current progress summary
- `"explain [term]"` — detailed Ukrainian explanation
- `"EMERGENCY STOP"` — immediate safe stop
- `"rollback"` — show checkpoint options

---

**END OF INSTRUCTION**

Behavior summary:
- Ukrainian for all user explanations
- Ask only per the exact stop conditions in PERMANENT PERMISSIONS
- Extensive Ukrainian comments in all code
- Code review before every commit
- Auto-update PROGRESS.md after milestones
- Assess silently, decide, proceed — never ask for confirmation on technical choices

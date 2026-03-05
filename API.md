# API Reference — Quiz Room Auto

WebSocket events specification for the Quiz Room Auto system.

**Transport:** Socket.IO 4.x (WebSocket with HTTP long-polling fallback)
**Default endpoint:** `http://localhost:8080`

---

## Connection

```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:8080');
```

---

## Client → Server Events

All events use an acknowledgement callback: `socket.emit(event, data, callback)`.

Callback format:
```javascript
// Success
{ success: true, ...data }

// Failure
{ success: false, error: "Human-readable error message" }
```

---

### `create-quiz`

Creates a new quiz room. Called by the quiz host.

**Request:**
```javascript
socket.emit('create-quiz', {
  quizData: {
    title: string,           // Required. Shown to players
    questions: [
      {
        question: string,    // Required. The question text
        answers: [           // Required. Exactly 4 strings
          string, string, string, string
        ],
        correctAnswer: number,  // Required. Index 0–3
        timeLimit: number       // Optional. Overrides config.questionTime
      }
    ]
  },
  settings: {                   // Optional. All fields override config.json defaults
    questionTime: number,        // 10–120 seconds
    answerRevealTime: number,    // 2–15 seconds
    leaderboardTime: number,     // 2–15 seconds
    autoStart: boolean,
    waitForAllPlayers: boolean,
    minPlayers: number,
    maxPlayers: number
  }
}, (response) => {
  // response.success: boolean
  // response.roomCode: string (6 chars, e.g. "AB3C7D")
  // response.error?: string
});
```

**Validation errors:**
- Missing `quizData` or `questions`
- Empty questions array
- Any question does not have exactly 4 answers
- `correctAnswer` is not 0–3

---

### `join-quiz`

Joins an existing quiz room. Called by each player.

**Request:**
```javascript
socket.emit('join-quiz', {
  roomCode: string,   // 6 chars, case-insensitive (auto-uppercased)
  nickname: string    // 2–20 characters
}, (response) => {
  // response.success: boolean
  // response.message: string
  // response.nickname: string
  // response.roomCode: string
  // response.gameState: GameState  (see GameState type below)
  // response.error?: string
});
```

**Validation errors:**
- Room code not 6 characters
- Room code not found
- Nickname shorter than 2 or longer than 20 characters
- Nickname already taken (case-insensitive)
- Game already started
- Room is full (maxPlayers reached)

---

### `submit-answer`

Submits the player's answer to the current question.

**Request:**
```javascript
socket.emit('submit-answer', {
  answerId: number    // 0, 1, 2, or 3
}, (response) => {
  // response.success: boolean
  // response.error?: string
});
```

**Validation errors:**
- Not currently in state `QUESTION`
- Socket not in any room
- Player already answered this question
- `answerId` is not 0–3

---

### `get-game-state`

Returns the current game state. Useful after a reconnect.

**Request:**
```javascript
socket.emit('get-game-state', {
  roomCode: string    // Optional if socket is already in a room
}, (response) => {
  // response.success: boolean
  // response.gameState: GameState
  // response.error?: string
});
```

---

## Server → Client Events

The server emits one event type: **`quiz-update`**, with a `type` field that identifies the specific update.

```javascript
socket.on('quiz-update', (data) => {
  // data.type is always present
});
```

---

### `quiz-update` — Type: `PLAYER_JOINED`

Broadcast when a player joins the room (during WAITING state).

```javascript
{
  type: 'PLAYER_JOINED',
  players: [
    { nickname: string, score: number }
  ],
  totalPlayers: number
}
```

---

### `quiz-update` — Type: `PLAYER_LEFT`

Broadcast when a player disconnects.

```javascript
{
  type: 'PLAYER_LEFT',
  nickname: string,
  players: [{ nickname: string, score: number }],
  totalPlayers: number
}
```

---

### `quiz-update` — Type: `QUIZ_STARTING`

Broadcast when the quiz is about to start (3-second countdown).

```javascript
{
  type: 'QUIZ_STARTING',
  countdown: 3,           // Always 3
  quizTitle: string,
  totalQuestions: number
}
```

---

### `quiz-update` — Type: `NEW_QUESTION`

Broadcast when a new question is displayed. **Does NOT include the correct answer.**

```javascript
{
  type: 'NEW_QUESTION',
  questionIndex: number,   // 1-based (e.g. 1, 2, 3...)
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
  timeLimit: number        // Seconds for this question
}
```

---

### `quiz-update` — Type: `ANSWER_COUNT`

Broadcast each time a player submits an answer.

```javascript
{
  type: 'ANSWER_COUNT',
  answered: number,   // How many players have answered
  total: number       // Total players in room
}
```

---

### `quiz-update` — Type: `REVEAL_ANSWER`

Broadcast when the question timer ends or all players answered.

```javascript
{
  type: 'REVEAL_ANSWER',
  correctAnswer: number,   // 0–3
  statistics: {
    total: number,          // Players who answered
    notAnswered: number,    // Players who did not answer
    answers: {
      0: { count: number, percentage: number },
      1: { count: number, percentage: number },
      2: { count: number, percentage: number },
      3: { count: number, percentage: number }
    }
  },
  playerResults: [
    {
      playerId: string,      // socket.id
      nickname: string,
      answerId: number | null,  // null = did not answer
      isCorrect: boolean,
      didNotAnswer: boolean,
      pointsEarned: number
    }
  ]
}
```

---

### `quiz-update` — Type: `SHOW_LEADERBOARD`

Broadcast after `answerRevealTime` seconds, between questions.

```javascript
{
  type: 'SHOW_LEADERBOARD',
  leaderboard: [
    {
      playerId: string,
      nickname: string,
      score: number,
      correctAnswers: number,
      totalQuestions: number,   // Questions shown so far
      avgAnswerTime: number,    // Seconds, rounded to 0.1
      position: number          // 1, 2, 3, ...
    }
  ],
  questionIndex: number,     // Current question number (1-based)
  totalQuestions: number,
  isLastQuestion: boolean
}
```

---

### `quiz-update` — Type: `QUIZ_ENDED`

Broadcast after the final leaderboard display.

```javascript
{
  type: 'QUIZ_ENDED',
  finalLeaderboard: [
    // Same structure as SHOW_LEADERBOARD.leaderboard
  ],
  totalQuestions: number
}
```

---

## HTTP Endpoints

### `GET /health`

Server health check.

**Response:**
```json
{
  "status": "ok",
  "uptime": 142,
  "activeSessions": 1,
  "timestamp": "2026-03-05T17:00:00.000Z"
}
```

---

### `GET /api/active-quizzes`

List all active quiz rooms.

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "roomCode": "AB3C7D",
      "title": "Friday Night Quiz",
      "playerCount": 5,
      "gameState": "QUESTION"
    }
  ]
}
```

---

### `GET /api/quizzes`

List all quiz files found in the `quizzes/` directory. Used by the QuizCreator "Load from library" feature.

**Response:**
```json
{
  "success": true,
  "quizzes": [
    {
      "id": "dummy-quiz-1",
      "title": "General Knowledge",
      "description": "",
      "questions": [ /* full question objects */ ]
    }
  ]
}
```

---

### `GET /api/stats`

Returns aggregate statistics and a history of completed sessions (up to 50, newest first). Data is persisted in `data/sessions.db` (SQLite).

**Response:**
```json
{
  "success": true,
  "totals": {
    "total_sessions": 12,
    "total_players": 47,
    "avg_players": 3.9
  },
  "sessions": [
    {
      "id": 12,
      "room_code": "AB3C7D",
      "title": "Friday Night Quiz",
      "started_at": 1741200000000,
      "ended_at": 1741200900000,
      "total_questions": 10,
      "player_count": 4,
      "topScorer": {
        "nickname": "Alice",
        "score": 1240
      }
    }
  ]
}
```

---

### `GET /api/stats/session/:id`

Returns the full leaderboard for a single completed session.

**Parameters:**
- `:id` — integer session ID (from `/api/stats`)

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "position": 1,
      "nickname": "Alice",
      "score": 1240,
      "correct_answers": 9,
      "avg_answer_time": 4.2
    }
  ]
}
```

---

### `GET /api/qr/:roomCode`

Generates a QR code PNG image that encodes the player join URL for the given room. Scan to open `http://<server-ip>:8080/?room=ROOMCODE` directly.

**Parameters:**
- `:roomCode` — 6-character room code (case-insensitive, auto-uppercased)

**Response:** `image/png` — 256×256 px PNG buffer

**Example usage in HTML:**
```html
<img src="/api/qr/AB3C7D" width="160" height="160" alt="QR code" />
```

---

## State Machine

```
WAITING
  └─→ STARTING      (autoStart + minPlayers reached, or manual)
        └─→ QUESTION         (after 3-second countdown)
              └─→ ANSWER_REVEAL   (timer expired OR all answered)
                    └─→ LEADERBOARD    (after answerRevealTime)
                          ├─→ QUESTION       (if more questions remain)
                          └─→ ENDED          (if last question)
```

**Valid game states:** `WAITING` · `STARTING` · `QUESTION` · `ANSWER_REVEAL` · `LEADERBOARD` · `ENDED`

---

## Scoring Formula

```
Correct answer:
  points = 100 + max(0, questionTime - answerTimeSeconds) × 2

Wrong answer or no answer:
  points = 0
```

**Leaderboard tiebreaker:** players with equal scores are ranked by average answer time (ascending — faster is better).

---

## TypeScript Types (reference)

```typescript
interface GameState {
  gameState: 'WAITING' | 'STARTING' | 'QUESTION' | 'ANSWER_REVEAL' | 'LEADERBOARD' | 'ENDED';
  players: { nickname: string; score: number }[];
  totalQuestions: number;
  currentQuestionIndex: number;  // -1 before start, 0-based during game
  quizTitle: string;
}

interface LeaderboardEntry {
  playerId: string;
  nickname: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  avgAnswerTime: number;
  position: number;
}
```

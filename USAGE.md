# Usage Guide — Quiz Room Auto

How to run quiz sessions from start to finish.

---

## Quick Flow

```
1. Host starts server  →  npm start
2. Host opens browser  →  http://localhost:8080
3. Host creates room   →  POST /api/create-quiz (or via UI when available)
4. Players join        →  enter room code + nickname on their phones
5. Game runs itself    →  automatic questions, timers, reveals, leaderboard
6. Quiz ends           →  final standings shown to everyone
```

---

## Starting a Session via WebSocket

The primary way to start a game is via the WebSocket API. Here is a complete example using the browser console or a simple HTML client:

### 1. Connect and create a room

```javascript
const socket = io('http://localhost:8080');

// Create a quiz room
socket.emit('create-quiz', {
  quizData: {
    title: 'Friday Night Quiz',
    questions: [
      {
        question: 'What year did Ukraine gain independence?',
        answers: ['1989', '1991', '1993', '1995'],
        correctAnswer: 1
      },
      {
        question: 'How many regions (oblasts) does Ukraine have?',
        answers: ['20', '22', '25', '27'],
        correctAnswer: 2
      }
    ]
  },
  settings: {
    questionTime: 25,
    answerRevealTime: 6,
    leaderboardTime: 8,
    autoStart: true,
    waitForAllPlayers: true,
    minPlayers: 2
  }
}, (response) => {
  if (response.success) {
    console.log('Room code:', response.roomCode);
    // Display this code on a projector screen for players to see
  }
});
```

### 2. Players join from their phones

Each player opens the web app and enters:
- **Room code** — the 6-character code shown above
- **Nickname** — any name 2–20 characters

```javascript
// This runs on the player's device
socket.emit('join-quiz', {
  roomCode: 'ABC123',
  nickname: 'Olena'
}, (response) => {
  if (response.success) {
    console.log('Joined!', response.gameState);
  }
});
```

### 3. Game runs automatically

Once `minPlayers` join (default: 1), the game starts automatically:

```
3 seconds countdown  →  Question 1 displays  →  Timer counts down
→  Answer revealed  →  Leaderboard shows  →  Question 2  →  ...  →  Final results
```

Players receive `quiz-update` events throughout:

```javascript
socket.on('quiz-update', (data) => {
  switch (data.type) {
    case 'QUIZ_STARTING':    // 3-second countdown
    case 'NEW_QUESTION':     // Show question + answers
    case 'ANSWER_COUNT':     // X/Y players answered
    case 'REVEAL_ANSWER':    // Show correct answer + scores
    case 'SHOW_LEADERBOARD': // Rankings between questions
    case 'QUIZ_ENDED':       // Final results
  }
});
```

### 4. Submitting an answer

```javascript
socket.emit('submit-answer', { answerId: 2 }, (response) => {
  // answerId: 0, 1, 2, or 3 (index of chosen answer)
  console.log(response.success ? 'Answer accepted!' : response.error);
});
```

---

## Using the Pre-Built Frontend

The React frontend at `http://localhost:8080` provides a ready-made player interface.

**Player flow (7 screens):**

| Screen | What the player sees |
|--------|---------------------|
| JOIN | Room code input + nickname input |
| WAITING | List of connected players, pulsing dots |
| STARTING | 3-second countdown animation |
| QUESTION | Question text + 4 colour-coded buttons + timer bar |
| ANSWER_SENT | "Answer submitted" + waiting for others |
| REVEAL | ✅/❌ result + points earned + correct answer |
| LEADERBOARD | Ranked list with medals 🥇🥈🥉 |
| ENDED | Final position + stats + "Play Again" |

---

## Loading Quizzes from Files

Quizzes stored in the `quizzes/` directory can be loaded via the storage API:

```javascript
const { loadAllQuizzes, loadQuizById } = require('./backend/src/quiz-storage');

// Load all quizzes
const quizzes = loadAllQuizzes();

// Load one by ID (filename without .json)
const quiz = loadQuizById('dummy-quiz-1');

// Use it to create a room
socket.emit('create-quiz', { quizData: quiz }, callback);
```

---

## Scoring System

Points are awarded only for **correct** answers:

```
basePoints = 100
timeBonus  = max(0, questionTime - answerTimeSeconds) × 2
totalPoints = basePoints + timeBonus
```

**Example:** Question time = 30s, player answers in 5s:
```
100 + (30 - 5) × 2 = 100 + 50 = 150 points
```

**Tiebreaker:** If two players have the same score, the one with the lower average answer time wins.

---

## Checking Server Health

```bash
curl http://localhost:8080/health
```

```json
{
  "status": "ok",
  "uptime": 142,
  "activeSessions": 1,
  "timestamp": "2026-03-05T17:00:00.000Z"
}
```

---

## Listing Active Rooms

```bash
curl http://localhost:8080/api/active-quizzes
```

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

## Tips for Live Events

- **Display the room code** on a TV/projector using the big screen at the venue
- **Set `questionTime: 20`** for fast-paced games; `30` for harder questions
- **Set `minPlayers: 2`** so the game doesn't auto-start until at least 2 people join
- **Use `waitForAllPlayers: true`** so fast players don't wait the full timer once everyone has answered
- **Run on a wired ethernet connection** for the host machine — Wi-Fi is fine for players

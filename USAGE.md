# Usage Guide — Quiz Room Auto

How to run quiz sessions from start to finish.

---

## Quick Flow

```
1. Host starts server   →  npm start
2. Host opens browser   →  http://localhost:8080#/create
3. Host creates room    →  Quiz Creator UI → Launch Quiz → room code + QR appear
4. Players join         →  scan QR code OR open app and type room code + nickname
5. Game runs itself     →  automatic questions, timers, reveals, leaderboard
6. Quiz ends            →  final standings shown to everyone, results saved to DB
7. View history         →  http://localhost:8080#/stats
```

---

## Pages

| URL | Who uses it | Purpose |
|-----|-------------|---------|
| `http://localhost:8080` | Players | Join screen (room code + nickname) |
| `http://localhost:8080/?room=AB3C7D` | Players | Join with room code pre-filled |
| `http://localhost:8080#/create` | Host | Create and launch a quiz |
| `http://localhost:8080#/admin` | Host | Monitor all active rooms live |
| `http://localhost:8080#/stats` | Host | View completed session history |

---

## Creating a Quiz (Browser UI)

### Step 1 — Open the Quiz Creator

```
http://localhost:8080#/create
```

### Step 2 — Build your quiz

- Enter a **quiz title**
- Add questions with the **+ Add question** button
- For each question: enter text, fill in 4 answers, click the letter button to mark the correct one
- Optionally set a per-question timer (overrides the global setting)
- Optionally add an **image URL** — shown above the question text on players' screens (🖼 badge appears on the list item)
- Optionally add an **audio URL** — auto-plays when the question starts, stops at answer reveal; replay button shown to players (🎵 badge appears on the list item)
- **Drag questions** by the ⠿ handle to reorder them

### Step 3 — Or load an existing quiz

- **⬆ Import JSON** — load a `.json` file from your computer
- **📂 From library** — pick any quiz from the `quizzes/` folder on the server

### Step 4 — Configure settings

| Setting | Default | Notes |
|---------|---------|-------|
| Time per question | 30s | Overridable per-question |
| Min. players | 1 | Game auto-starts when this many join |
| Autostart | on | Disable to start manually |

### Step 5 — Launch

Click **🚀 Launch Quiz**. On success you'll see:
- The 6-character **room code** (large, shareable)
- A **QR code** — players scan it to open the join URL directly

### Step 6 — Save for later (optional)

Click **⬇ Save JSON** at any point to download the quiz as a file. Drop it in `quizzes/` to make it available in the library.

---

## Players Joining

Players have three ways to join:

1. **Scan the QR code** displayed after room creation or on the admin panel — opens the join page with the room code already filled in
2. **Direct URL** — share `http://[server-ip]:8080/?room=AB3C7D`; the room code field is pre-filled
3. **Manual entry** — open `http://[server-ip]:8080` and type the code + nickname

**Player flow (8 screens):**

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

## Admin Panel

```
http://localhost:8080#/admin
```

Shows all active rooms in real time (polls every 2 seconds):
- Room code, quiz title, current game state, player count
- QR code for each room (80px) — point a camera at it to join instantly
- Copy-to-clipboard button for the room code
- Link to the statistics dashboard

---

## Statistics Dashboard

```
http://localhost:8080#/stats
```

Displays all completed sessions saved to `data/sessions.db`:
- **Summary cards** — total sessions, total players, average players per session
- **Session history table** — date, quiz title, player count, top scorer
- **Expandable rows** — click "Leaderboard" on any row to see the full ranked results

Results are saved automatically at the end of every quiz. No setup required.

---

## Starting a Session via WebSocket (advanced)

The UI handles this for you, but you can also create rooms programmatically:

```javascript
const socket = io('http://localhost:8080');

socket.emit('create-quiz', {
  quizData: {
    title: 'Friday Night Quiz',
    questions: [
      {
        question: 'What year did Ukraine gain independence?',
        answers: ['1989', '1991', '1993', '1995'],
        correctAnswer: 1
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
    // Generate QR: GET /api/qr/AB3C7D
  }
});
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

See [API.md](API.md) for full event payloads.

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
100 + (30 - 5) × 2 = 150 points
```

**Tiebreaker:** Equal scores → lower average answer time wins.

---

## Language Toggle

Every page has a **UK / EN** button to switch between Ukrainian and English. The preference is saved in `localStorage` and persists across sessions.

---

## Useful API Calls

```bash
# Server health
curl http://localhost:8080/health

# Active rooms
curl http://localhost:8080/api/active-quizzes

# Quiz library (files in quizzes/)
curl http://localhost:8080/api/quizzes

# Session history (SQLite)
curl http://localhost:8080/api/stats

# Leaderboard for session id=3
curl http://localhost:8080/api/stats/session/3

# QR code for a room (returns image/png)
curl http://localhost:8080/api/qr/AB3C7D --output qr.png
```

---

## Tips for Live Events

- **Show the QR code on a projector** — players can scan without typing anything
- **Use `/?room=CODE` links** — pre-fill the room code in shared links or on printed cards
- **Set `questionTime: 20`** for fast-paced games; `30` for harder questions
- **Set `minPlayers: 2`** so the game doesn't auto-start before enough people join
- **Use `waitForAllPlayers: true`** so fast players don't wait once everyone has answered
- **Check `#/stats` after each night** — full session history is saved automatically
- **Run on a wired ethernet connection** for the host machine — Wi-Fi is fine for players
- **For image questions**, use direct image URLs (Imgur, Wikimedia Commons, or your own server) — the image appears above the question text on every player's screen
- **For music questions**, ask players to tap the screen once before the quiz starts to avoid browser autoplay blocks; the 🎵 Replay button lets anyone manually start the audio if it was blocked

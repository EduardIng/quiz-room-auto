# Setup Guide — Quiz Room Auto

Complete installation and configuration instructions.

---

## Requirements

| Software | Minimum | Recommended |
|----------|---------|-------------|
| Node.js  | 18.0.0  | 25.x (LTS)  |
| npm      | 9.0.0   | 11.x        |
| RAM      | 256 MB  | 512 MB+     |
| Disk     | 200 MB  | 1 GB        |

**Network:** All players must be on the same Wi-Fi network as the host machine.

---

## Installation

### Step 1: Clone or download the project

```bash
git clone https://github.com/EduardIng/quiz-room-auto.git
cd quiz-room-auto
```

### Step 2: Install backend dependencies

```bash
npm install
```

Expected output: `added N packages`

### Step 3: Install and build frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

Expected output: `✓ built in Xms`

### Step 4: Verify installation

```bash
npm test
```

Expected output: `66 passed, 0 failed`

### Step 5: Start the server

```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════╗
║       Quiz Room Auto - Запущено!       ║
╠════════════════════════════════════════╣
║  Локально:  http://localhost:8080      ║
║  Мережа:    http://10.0.1.36:8080      ║
╚════════════════════════════════════════╝
```

Open `http://localhost:8080` in a browser to verify.

---

## Configuration

All settings live in `config.json` at the project root.

### Server settings

```json
"server": {
  "port": 8080,    // HTTP port (change if 8080 is taken)
  "host": "0.0.0.0" // Listen on all interfaces (required for LAN access)
}
```

### Quiz timing

```json
"quiz": {
  "questionTime": 30,        // Range: 10–120 seconds
  "answerRevealTime": 5,     // Range: 2–15 seconds
  "leaderboardTime": 5,      // Range: 2–15 seconds
  "autoStart": true,         // Auto-start when minPlayers join
  "waitForAllPlayers": true, // End question early if everyone answered
  "minPlayers": 1,           // Minimum to auto-start
  "maxPlayers": 8            // Hard cap per room
}
```

**Recommended settings for a pub quiz night:**
```json
"questionTime": 20,
"answerRevealTime": 6,
"leaderboardTime": 8,
"minPlayers": 2
```

### Display & sounds

```json
"display": {
  "fullscreen": true,
  "fontSize": "large"
},
"sounds": {
  "enabled": true,
  "volume": 0.7    // 0.0 – 1.0
}
```

---

## Adding Your Own Quizzes

Create a `.json` file in the `quizzes/` directory:

```json
{
  "title": "My Quiz",
  "description": "Optional description",
  "questions": [
    {
      "question": "What is the capital of France?",
      "answers": ["London", "Berlin", "Paris", "Rome"],
      "correctAnswer": 2,
      "timeLimit": 20
    }
  ]
}
```

**Field reference:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Quiz name shown to players |
| `description` | string | — | Optional description |
| `questions` | array | ✅ | Array of question objects |
| `question` | string | ✅ | The question text |
| `answers` | string[4] | ✅ | Exactly 4 answer options |
| `correctAnswer` | number | ✅ | Index of correct answer (0–3) |
| `timeLimit` | number | — | Per-question override (10–120s) |

---

## Running in Development Mode

Use `nodemon` for auto-restart on file changes:

```bash
npm run dev
```

For frontend development with hot reload:

```bash
# Terminal 1: backend
npm run dev

# Terminal 2: frontend dev server (proxies to backend)
cd frontend
npm start
# Opens http://localhost:3000
```

---

## Port Conflicts

If port 8080 is already in use:

1. Edit `config.json`: change `"port": 8080` to another value (e.g. `3001`)
2. Restart the server

---

## Firewall (macOS)

If players cannot connect from other devices, allow Node.js through the firewall:

**System Settings → Network → Firewall → Options**
Allow incoming connections for `node`

Or temporarily disable the firewall for the session.

---

## Verifying Network Access

After starting, run this from another device on the same Wi-Fi:

```
http://[IP shown in terminal]:8080/health
```

Should return: `{"status":"ok","uptime":...}`

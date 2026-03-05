# Decision Log - Журнал Рішень

## Format
Each decision includes: date, problem, options considered, chosen solution, reasoning.

---

## Decision 001 - 2026-03-05
**Problem:** Choose WebSocket library
**Options:**
- A: Socket.IO - higher abstraction, auto-reconnect, fallbacks
- B: Native WebSocket - lower overhead, more control

**Chosen:** Socket.IO (Option A)
**Reasoning:** Automatic reconnect is critical for commercial quiz rooms. If a player's phone disconnects briefly, they should rejoin seamlessly. Socket.IO handles this out of the box.

---

## Decision 002 - 2026-03-05
**Problem:** Frontend framework
**Options:**
- A: React - component-based, good ecosystem
- B: Vanilla JS - no build step, simpler
- C: Vue.js - similar to React but lighter

**Chosen:** React (Option A)
**Reasoning:** Component reusability for PlayerView, AdminPanel. Strong ecosystem for future features. Team familiarity assumption.

---
## Decision 003 - 2026-03-05
**Problem:** Choose persistent storage backend for session history
**Options:**
- A: better-sqlite3 — embedded, file-based, zero config, synchronous API
- B: PostgreSQL / MySQL — full relational DB, requires separate process
- C: JSON files — simplest, no dependencies, hard to query

**Chosen:** better-sqlite3 (Option A)
**Reasoning:** The system is a local-network tool for a single venue — there is no multi-server deployment need. SQLite requires no daemon, no connection string, and the synchronous API fits naturally into the existing Node.js callback style. The `data/sessions.db` file is trivially backed up by copying one file.

---

## Decision 004 - 2026-03-05
**Problem:** Where to generate QR codes — client or server
**Options:**
- A: Server-side (Node.js `qrcode` → PNG buffer) — one request, no JS bundle cost
- B: Client-side (`qrcode` in browser bundle) — no server round-trip, larger bundle

**Chosen:** Server-side (Option A)
**Reasoning:** QR codes are displayed in AdminPanel and QuizCreator. Generating them server-side keeps the browser bundle small and lets `<img src="/api/qr/:roomCode">` work in any context (including non-React pages). The server already knows the correct LAN IP, which the client cannot determine reliably.

---

## Decision 005 - 2026-03-05
**Problem:** i18n approach — library vs. hand-rolled
**Options:**
- A: `react-i18next` / `i18next` — full-featured, namespace support, plurals
- B: Hand-rolled `TRANSLATIONS` object + `useLang()` hook — zero dependencies

**Chosen:** Hand-rolled (Option B)
**Reasoning:** Only two languages (Ukrainian, English) and a small, stable set of strings. A full i18n library would add ~40 KB to the bundle and significant configuration overhead for a problem that is solved in ~80 lines. The `useLang()` hook is straightforward to extend if a third language is ever needed.

---

## Decision 006 - 2026-03-05
**Problem:** How players discover the room — typed code vs. QR vs. direct URL
**Options:**
- A: Typed code only (original design)
- B: QR code only
- C: All three: QR scan → direct URL with `?room=` pre-fill → manual code entry

**Chosen:** All three (Option C)
**Reasoning:** Different venue setups suit different flows. A projector screen works best with a typed code. A printed flyer or tablet works best with a QR scan. Sharing a link in a chat works best with a pre-filled URL. Supporting all three costs little (one `URLSearchParams` read on mount, one `<img>` tag) and removes friction for every scenario.

---

## Decision 007 - 2026-03-05
**Problem:** Stats dashboard data — live polling vs. SQLite persistence
**Options:**
- A: Store results in memory, poll `/api/active-quizzes` — lost on server restart
- B: Persist to SQLite after each quiz ends — survives restarts, queryable

**Chosen:** SQLite persistence (Option B)
**Reasoning:** Session history is only useful if it survives across server restarts and multiple quiz nights. Polling active sessions gives no historical data. Writing to SQLite at the end of `endQuiz()` is a single atomic transaction and adds no latency to the game flow.

---

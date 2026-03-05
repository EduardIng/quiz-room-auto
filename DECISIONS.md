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

# Known Issues - Відомі Проблеми

## Format
Each issue: ID, status, description, workaround.

---

## Status Legend
- 🔴 Open - Не вирішено
- 🟡 In Progress - В процесі вирішення
- 🟢 Resolved - Вирішено
- ⚪ Won't Fix - Не буде виправлено

---

## KI-001 🔴 QR code encodes IP at room-creation time

**Affects:** `GET /api/qr/:roomCode`

**Description:** The QR code URL is generated using the server's local IP address at the moment the room is created. If the server's IP changes mid-session (e.g. DHCP reassignment, network switch), QR codes already displayed will point to the old address.

**Workaround:** Share the room code as text alongside the QR. Players can always join manually at the current server IP.

---

## KI-002 🔴 `better-sqlite3` requires native compilation

**Affects:** Fresh installs on some systems

**Description:** `better-sqlite3` is a native Node.js addon. On machines without build tools (Python, `make`, C++ compiler), `npm install` may fail with a `node-gyp` error.

**Workaround:** Install build tools first:
- **macOS:** `xcode-select --install`
- **Windows:** `npm install --global windows-build-tools`
- **Linux (Debian/Ubuntu):** `sudo apt install build-essential`

---

## KI-003 🔴 Stats panel leaderboard rows require a second API endpoint

**Affects:** `#/stats` expandable rows

**Description:** Expanding a session row in the stats dashboard triggers a separate `GET /api/stats/session/:id` request. If many sessions are expanded rapidly, multiple concurrent requests are fired. There is no loading indicator per row beyond the `...` placeholder.

**Workaround:** Expand one row at a time. The result is cached client-side once loaded, so re-expanding the same row is instant.

---

## KI-004 🔴 Language preference is per-browser, not per-session

**Affects:** i18n (`useLang` hook)

**Description:** The selected language (UK/EN) is stored in `localStorage`. Players on the same device will share the language setting. There is no server-side language negotiation.

**Workaround:** Each player can switch language independently on their own device using the toggle button.

---

## KI-005 ⚪ No authentication on admin/stats pages

**Affects:** `#/admin`, `#/stats`, `#/create`

**Description:** All pages are publicly accessible to anyone on the network. There is no login or API key protection.

**Decision:** Won't Fix — this is a local-network tool intended for trusted venue environments. Adding auth would significantly increase setup complexity for the target use case.

---

## KI-006 🔴 `data/sessions.db` not excluded from git

**Affects:** Version control

**Description:** The `data/` directory containing the SQLite database is not in `.gitignore`. If committed, it could expose session history in the repository.

**Workaround:** Add `data/` to `.gitignore`:
```bash
echo "data/" >> .gitignore
git rm -r --cached data/ 2>/dev/null; git add .gitignore
```

---

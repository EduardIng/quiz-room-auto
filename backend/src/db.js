/**
 * db.js - Persistent SQLite storage for quiz sessions
 *
 * Singleton QuizDatabase class that stores session history,
 * results, and question statistics in data/sessions.db.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { log } = require('./utils');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'sessions.db');

class QuizDatabase {
  constructor() {
    // Ensure data/ directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this._createTables();
    log('DB', `SQLite database opened: ${DB_PATH}`);
  }

  _createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT NOT NULL,
        title TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        player_count INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES sessions(id),
        position INTEGER NOT NULL,
        nickname TEXT NOT NULL,
        score INTEGER NOT NULL,
        correct_answers INTEGER NOT NULL,
        avg_answer_time REAL
      );

      CREATE TABLE IF NOT EXISTS question_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES sessions(id),
        question_index INTEGER NOT NULL,
        total_answered INTEGER NOT NULL,
        not_answered INTEGER NOT NULL,
        answer_0 INTEGER NOT NULL DEFAULT 0,
        answer_1 INTEGER NOT NULL DEFAULT 0,
        answer_2 INTEGER NOT NULL DEFAULT 0,
        answer_3 INTEGER NOT NULL DEFAULT 0
      );
    `);
  }

  /**
   * Saves a completed quiz session with leaderboard and per-question stats.
   *
   * @param {string} roomCode
   * @param {string} title
   * @param {number} startedAt - Date.now() when quiz started
   * @param {number} endedAt   - Date.now() when quiz ended
   * @param {number} totalQuestions
   * @param {Array}  leaderboard - [{nickname, score, correctAnswers, avgAnswerTime, position}]
   * @param {Array}  questionStats - [{total, notAnswered, answers: {0:..,1:..,2:..,3:..}}]
   */
  saveSession(roomCode, title, startedAt, endedAt, totalQuestions, leaderboard, questionStats) {
    try {
      const insertSession = this.db.prepare(`
        INSERT INTO sessions (room_code, title, started_at, ended_at, total_questions, player_count)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertResult = this.db.prepare(`
        INSERT INTO results (session_id, position, nickname, score, correct_answers, avg_answer_time)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const insertQStat = this.db.prepare(`
        INSERT INTO question_stats (session_id, question_index, total_answered, not_answered, answer_0, answer_1, answer_2, answer_3)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const save = this.db.transaction(() => {
        const info = insertSession.run(roomCode, title, startedAt, endedAt, totalQuestions, leaderboard.length);
        const sessionId = info.lastInsertRowid;

        for (const player of leaderboard) {
          insertResult.run(sessionId, player.position, player.nickname, player.score, player.correctAnswers, player.avgAnswerTime || null);
        }

        for (let i = 0; i < questionStats.length; i++) {
          const qs = questionStats[i];
          insertQStat.run(sessionId, i, qs.total, qs.notAnswered,
            qs.answers[0]?.count || 0,
            qs.answers[1]?.count || 0,
            qs.answers[2]?.count || 0,
            qs.answers[3]?.count || 0
          );
        }

        return sessionId;
      });

      const sessionId = save();
      log('DB', `Session saved: room=${roomCode}, id=${sessionId}, players=${leaderboard.length}`);
    } catch (err) {
      log('DB', `Error saving session: ${err.message}`);
    }
  }

  /**
   * Returns recent sessions with top scorer info.
   *
   * @param {number} limit - Max sessions to return
   * @returns {Array}
   */
  getSessions(limit = 50) {
    try {
      const sessions = this.db.prepare(`
        SELECT s.id, s.room_code, s.title, s.started_at, s.ended_at,
               s.total_questions, s.player_count
        FROM sessions s
        ORDER BY s.ended_at DESC
        LIMIT ?
      `).all(limit);

      // Attach top scorer for each session
      const topScorer = this.db.prepare(`
        SELECT nickname, score FROM results WHERE session_id = ? ORDER BY position ASC LIMIT 1
      `);

      return sessions.map(s => ({
        ...s,
        topScorer: topScorer.get(s.id) || null
      }));
    } catch (err) {
      log('DB', `Error fetching sessions: ${err.message}`);
      return [];
    }
  }

  /**
   * Returns full leaderboard for a specific session.
   *
   * @param {number} sessionId
   * @returns {Array}
   */
  getSessionResults(sessionId) {
    try {
      return this.db.prepare(`
        SELECT position, nickname, score, correct_answers, avg_answer_time
        FROM results WHERE session_id = ? ORDER BY position ASC
      `).all(sessionId);
    } catch (err) {
      log('DB', `Error fetching results: ${err.message}`);
      return [];
    }
  }

  /**
   * Returns aggregate statistics across all sessions.
   *
   * @returns {Object}
   */
  getStats() {
    try {
      const totals = this.db.prepare(`
        SELECT COUNT(*) as total_sessions,
               SUM(player_count) as total_players,
               AVG(player_count) as avg_players
        FROM sessions
      `).get();

      const sessions = this.getSessions(50);
      return { totals, sessions };
    } catch (err) {
      log('DB', `Error fetching stats: ${err.message}`);
      return { totals: { total_sessions: 0, total_players: 0, avg_players: 0 }, sessions: [] };
    }
  }
}

// Singleton instance
let instance = null;

function getDb() {
  if (!instance) instance = new QuizDatabase();
  return instance;
}

module.exports = getDb();

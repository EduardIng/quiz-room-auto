/**
 * AdminPanel.jsx - Адмін-панель для моніторингу активних квізів
 *
 * Показує всі активні кімнати в реальному часі:
 * - Код кімнати
 * - Назва квізу
 * - Поточний стан гри
 * - Кількість гравців
 * - Кнопка копіювання коду кімнати
 *
 * Оновлення: опитує /api/active-quizzes кожні 2 секунди
 */

import React, { useState, useEffect, useCallback } from 'react';
import './AdminPanel.css';

// Переклад станів гри для відображення
const STATE_LABELS = {
  WAITING:       { label: 'Очікування',  color: '#f39c12' },
  STARTING:      { label: 'Старт!',      color: '#3498db' },
  QUESTION:      { label: 'Питання',     color: '#27ae60' },
  ANSWER_REVEAL: { label: 'Відповідь',   color: '#8e44ad' },
  LEADERBOARD:   { label: 'Рейтинг',     color: '#2980b9' },
  ENDED:         { label: 'Завершено',   color: '#7f8c8d' },
};

export default function AdminPanel() {
  // Список активних сесій від API
  const [sessions, setSessions] = useState([]);

  // Стан з'єднання з сервером
  const [status, setStatus] = useState('connecting'); // 'connecting' | 'ok' | 'error'

  // Час останнього оновлення
  const [lastUpdate, setLastUpdate] = useState(null);

  // Повідомлення про скопійований код
  const [copiedCode, setCopiedCode] = useState(null);

  // Час роботи сервера (uptime)
  const [serverUptime, setServerUptime] = useState(null);

  /**
   * Запитує активні сесії з API
   * Викликається кожні 2 секунди через setInterval
   */
  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/active-quizzes');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      setSessions(data.sessions || []);
      setStatus('ok');
      setLastUpdate(new Date());
    } catch {
      setStatus('error');
    }
  }, []);

  /**
   * Запитує health endpoint для отримання uptime сервера
   */
  const fetchHealth = useCallback(async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      setServerUptime(data.uptime);
    } catch {
      // Ігноруємо помилки health check
    }
  }, []);

  // Запускаємо polling при монтуванні компонента
  useEffect(() => {
    // Перший запит одразу
    fetchSessions();
    fetchHealth();

    // Потім кожні 2 секунди
    const sessionsInterval = setInterval(fetchSessions, 2000);
    const healthInterval = setInterval(fetchHealth, 10000);

    return () => {
      clearInterval(sessionsInterval);
      clearInterval(healthInterval);
    };
  }, [fetchSessions, fetchHealth]);

  /**
   * Копіює код кімнати в буфер обміну
   * Показує підтвердження на 2 секунди
   *
   * @param {string} code - Код кімнати для копіювання
   */
  const copyCode = useCallback((code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  }, []);

  /**
   * Форматує uptime у читабельний формат
   * Наприклад: 3661 → "1год 1хв 1с"
   *
   * @param {number} seconds - Секунди роботи сервера
   * @returns {string} Відформатований рядок
   */
  function formatUptime(seconds) {
    if (!seconds && seconds !== 0) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}год ${m}хв`;
    if (m > 0) return `${m}хв ${s}с`;
    return `${s}с`;
  }

  /**
   * Форматує час останнього оновлення
   *
   * @param {Date} date - Дата оновлення
   * @returns {string} Рядок "ЧЧ:ХХ:СС"
   */
  function formatTime(date) {
    if (!date) return '—';
    return date.toLocaleTimeString('uk-UA');
  }

  return (
    <div className="admin-panel">
      {/* ── Хедер ── */}
      <header className="admin-header">
        <div className="admin-header-left">
          <h1 className="admin-title">🎮 Quiz Room Admin</h1>
          <p className="admin-subtitle">Моніторинг активних квізів</p>
        </div>
        <div className="admin-header-right">
          {/* Індикатор стану з'єднання */}
          <div className={`status-indicator ${status}`}>
            <span className="status-dot" />
            <span className="status-text">
              {status === 'ok' ? 'Онлайн' : status === 'error' ? 'Помилка' : 'З\'єднання...'}
            </span>
          </div>
          <a href="/" className="admin-nav-link">👤 Гравець</a>
          <a href="#/create" className="admin-nav-link admin-nav-primary">+ Новий квіз</a>
        </div>
      </header>

      {/* ── Статистика сервера ── */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-card-value">{sessions.length}</div>
          <div className="stat-card-label">Активних кімнат</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">
            {sessions.reduce((sum, s) => sum + s.playerCount, 0)}
          </div>
          <div className="stat-card-label">Гравців онлайн</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{formatUptime(serverUptime)}</div>
          <div className="stat-card-label">Сервер працює</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{formatTime(lastUpdate)}</div>
          <div className="stat-card-label">Оновлено</div>
        </div>
      </div>

      {/* ── Список активних кімнат ── */}
      <div className="admin-content">
        <h2 className="section-title">Активні кімнати</h2>

        {status === 'error' && (
          <div className="admin-error">
            ⚠️ Не вдається підключитись до сервера. Перевір що сервер запущений на порту 8080.
          </div>
        )}

        {status === 'ok' && sessions.length === 0 && (
          <div className="admin-empty">
            <div className="admin-empty-icon">📭</div>
            <p>Активних квіз-кімнат немає</p>
            <a href="#/create" className="btn-primary-small">Створити квіз</a>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="sessions-grid">
            {sessions.map((session) => {
              const stateInfo = STATE_LABELS[session.gameState] || { label: session.gameState, color: '#95a5a6' };

              return (
                <div key={session.roomCode} className="session-card">
                  {/* Код кімнати */}
                  <div className="session-code-row">
                    <span className="session-code">{session.roomCode}</span>
                    <button
                      className={`copy-btn ${copiedCode === session.roomCode ? 'copied' : ''}`}
                      onClick={() => copyCode(session.roomCode)}
                      title="Копіювати код"
                    >
                      {copiedCode === session.roomCode ? '✓ Скопійовано' : '📋 Копіювати'}
                    </button>
                  </div>

                  {/* Назва квізу */}
                  <div className="session-title">{session.title}</div>

                  {/* Стан та гравці */}
                  <div className="session-meta">
                    <span
                      className="session-state"
                      style={{ background: stateInfo.color + '22', color: stateInfo.color, borderColor: stateInfo.color + '44' }}
                    >
                      {stateInfo.label}
                    </span>
                    <span className="session-players">
                      👥 {session.playerCount} гравців
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

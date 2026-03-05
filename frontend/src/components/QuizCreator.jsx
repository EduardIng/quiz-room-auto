/**
 * QuizCreator.jsx - Інтерфейс для створення квізу в браузері
 *
 * Дозволяє:
 * - Введення назви квізу
 * - Додавання/видалення питань
 * - Вибір правильної відповіді
 * - Перегляд питань
 * - Запуск гри → отримання коду кімнати
 * - Експорт квізу як JSON файл
 */

import React, { useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import './QuizCreator.css';

// URL бекенду
const SERVER_URL = import.meta.env.DEV ? 'http://localhost:8080' : window.location.origin;

// Порожнє питання — шаблон для нового питання
const EMPTY_QUESTION = () => ({
  question: '',
  answers: ['', '', '', ''],
  correctAnswer: 0,
  timeLimit: ''  // порожнє = використовувати глобальний config.questionTime
});

export default function QuizCreator() {
  // ── Стан квізу ──
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);

  // ── Налаштування гри ──
  const [questionTime, setQuestionTime] = useState(30);
  const [autoStart, setAutoStart] = useState(true);
  const [minPlayers, setMinPlayers] = useState(1);

  // ── Стан UI ──
  const [activeQuestion, setActiveQuestion] = useState(0); // Індекс активного питання
  const [isCreating, setIsCreating] = useState(false);     // Йде запит до сервера
  const [roomCode, setRoomCode] = useState(null);          // Отриманий код кімнати
  const [error, setError] = useState('');                  // Повідомлення про помилку

  // Socket.IO ref (підключаємо лише при потребі)
  const socketRef = useRef(null);

  // ─────────────────────────────────────────────
  // УПРАВЛІННЯ ПИТАННЯМИ
  // ─────────────────────────────────────────────

  /**
   * Додає нове порожнє питання в кінець списку
   */
  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, EMPTY_QUESTION()]);
    // Автоматично переходимо до нового питання
    setActiveQuestion(prev => questions.length);
  }, [questions.length]);

  /**
   * Видаляє питання за індексом
   * Не дозволяє видалити якщо залишилось тільки одне
   *
   * @param {number} index - Індекс питання для видалення
   */
  const removeQuestion = useCallback((index) => {
    if (questions.length <= 1) return; // Мінімум одне питання
    setQuestions(prev => prev.filter((_, i) => i !== index));
    setActiveQuestion(prev => Math.min(prev, questions.length - 2));
  }, [questions.length]);

  /**
   * Оновлює поле питання
   *
   * @param {number} qIndex - Індекс питання
   * @param {string} value - Нове значення тексту питання
   */
  const updateQuestionText = useCallback((qIndex, value) => {
    setQuestions(prev => prev.map((q, i) =>
      i === qIndex ? { ...q, question: value } : q
    ));
  }, []);

  /**
   * Оновлює один варіант відповіді
   *
   * @param {number} qIndex - Індекс питання
   * @param {number} aIndex - Індекс відповіді (0-3)
   * @param {string} value  - Новий текст відповіді
   */
  const updateAnswer = useCallback((qIndex, aIndex, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q;
      const answers = [...q.answers];
      answers[aIndex] = value;
      return { ...q, answers };
    }));
  }, []);

  /**
   * Встановлює правильну відповідь для питання
   *
   * @param {number} qIndex   - Індекс питання
   * @param {number} ansIndex - Індекс правильної відповіді (0-3)
   */
  const setCorrectAnswer = useCallback((qIndex, ansIndex) => {
    setQuestions(prev => prev.map((q, i) =>
      i === qIndex ? { ...q, correctAnswer: ansIndex } : q
    ));
  }, []);

  /**
   * Встановлює таймер для конкретного питання
   *
   * @param {number} qIndex - Індекс питання
   * @param {string} value  - Значення таймера (порожнє = глобальний)
   */
  const updateTimeLimit = useCallback((qIndex, value) => {
    setQuestions(prev => prev.map((q, i) =>
      i === qIndex ? { ...q, timeLimit: value } : q
    ));
  }, []);

  // ─────────────────────────────────────────────
  // ВАЛІДАЦІЯ
  // ─────────────────────────────────────────────

  /**
   * Перевіряє чи квіз готовий до запуску
   * Повертає масив помилок (порожній = все ОК)
   *
   * @returns {string[]} Масив рядків з описами помилок
   */
  const validate = useCallback(() => {
    const errors = [];

    if (!title.trim()) {
      errors.push('Введіть назву квізу');
    }

    questions.forEach((q, i) => {
      if (!q.question.trim()) {
        errors.push(`Питання ${i + 1}: введіть текст питання`);
      }
      const emptyAnswers = q.answers.filter(a => !a.trim());
      if (emptyAnswers.length > 0) {
        errors.push(`Питання ${i + 1}: заповніть усі 4 варіанти відповіді`);
      }
    });

    return errors;
  }, [title, questions]);

  // ─────────────────────────────────────────────
  // ЗАПУСК ГРИ
  // ─────────────────────────────────────────────

  /**
   * Підключається до сервера і створює квіз-кімнату
   * Після успіху показує код кімнати
   */
  const handleCreateRoom = useCallback(() => {
    const errors = validate();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setError('');
    setIsCreating(true);

    // Підготовуємо дані квізу (прибираємо порожні timeLimit)
    const quizData = {
      title: title.trim(),
      questions: questions.map(q => {
        const result = {
          question: q.question.trim(),
          answers: q.answers.map(a => a.trim()),
          correctAnswer: q.correctAnswer
        };
        // Додаємо timeLimit тільки якщо він заданий
        const tl = parseInt(q.timeLimit, 10);
        if (!isNaN(tl) && tl >= 10 && tl <= 120) {
          result.timeLimit = tl;
        }
        return result;
      })
    };

    const settings = {
      questionTime,
      autoStart,
      minPlayers,
      waitForAllPlayers: true
    };

    // Підключаємося до сервера
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      // Надсилаємо запит на створення кімнати
      socket.emit('create-quiz', { quizData, settings }, (response) => {
        setIsCreating(false);

        if (response.success) {
          setRoomCode(response.roomCode);
        } else {
          setError(response.error || 'Помилка створення кімнати');
          socket.disconnect();
        }
      });
    });

    socket.on('connect_error', () => {
      setIsCreating(false);
      setError('Не вдалось підключитись до сервера. Переконайся що сервер запущений.');
      socket.disconnect();
    });
  }, [validate, title, questions, questionTime, autoStart, minPlayers]);

  /**
   * Скидає форму для створення нового квізу
   */
  const handleReset = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setRoomCode(null);
    setTitle('');
    setQuestions([EMPTY_QUESTION()]);
    setActiveQuestion(0);
    setError('');
  }, []);

  // ─────────────────────────────────────────────
  // ЕКСПОРТ JSON
  // ─────────────────────────────────────────────

  /**
   * Завантажує квіз як JSON файл
   * Дозволяє зберегти квіз у папку quizzes/ для повторного використання
   */
  const handleExportJSON = useCallback(() => {
    const quizData = {
      title: title.trim() || 'Мій квіз',
      description: '',
      questions: questions.map(q => ({
        question: q.question.trim(),
        answers: q.answers.map(a => a.trim()),
        correctAnswer: q.correctAnswer,
        ...(q.timeLimit ? { timeLimit: parseInt(q.timeLimit, 10) } : {})
      }))
    };

    // Створюємо Blob та посилання для завантаження
    const blob = new Blob([JSON.stringify(quizData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'quiz').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title, questions]);

  // ─────────────────────────────────────────────
  // РЕНДЕР
  // ─────────────────────────────────────────────

  const LETTERS = ['A', 'B', 'C', 'D'];
  const LETTER_COLORS = ['var(--color-answer-a)', 'var(--color-answer-b)', 'var(--color-answer-c)', 'var(--color-answer-d)'];
  const currentQ = questions[activeQuestion];

  // ── Успішне створення кімнати ──
  if (roomCode) {
    return (
      <div className="creator-page">
        <div className="creator-success">
          <div className="success-icon">🎉</div>
          <h2>Кімнату створено!</h2>
          <p className="success-subtitle">Поділись кодом з гравцями</p>

          <div className="room-code-display">{roomCode}</div>

          <p className="success-info">
            Гравці підключаються на:{' '}
            <strong>
              {window.location.protocol}//{window.location.hostname}:{window.location.port || 8080}
            </strong>
          </p>

          <div className="success-actions">
            <a href="/" className="btn-outlined">👤 Відкрити як гравець</a>
            <button className="btn-primary-creator" onClick={handleReset}>+ Новий квіз</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-page">
      {/* ── Хедер ── */}
      <header className="creator-header">
        <h1 className="creator-title">✏️ Створити квіз</h1>
        <div className="creator-header-right">
          <a href="#/admin" className="admin-link">🖥️ Admin</a>
          <a href="/" className="admin-link">👤 Гравець</a>
        </div>
      </header>

      <div className="creator-layout">
        {/* ── ЛІВА КОЛОНКА: Назва + список питань ── */}
        <aside className="creator-sidebar">
          {/* Назва квізу */}
          <div className="sidebar-section">
            <label className="field-label">Назва квізу</label>
            <input
              className="creator-input"
              type="text"
              placeholder="Наприклад: П'ятниця — Quiz Night"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
            />
          </div>

          {/* Список питань */}
          <div className="sidebar-section">
            <label className="field-label">Питання ({questions.length})</label>
            <div className="questions-list">
              {questions.map((q, i) => (
                <button
                  key={i}
                  className={`question-list-item ${i === activeQuestion ? 'active' : ''} ${q.question.trim() ? 'filled' : ''}`}
                  onClick={() => setActiveQuestion(i)}
                >
                  <span className="q-number">#{i + 1}</span>
                  <span className="q-preview">
                    {q.question.trim() || 'Без тексту...'}
                  </span>
                  {questions.length > 1 && (
                    <button
                      className="q-remove"
                      onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                      title="Видалити питання"
                    >×</button>
                  )}
                </button>
              ))}
            </div>
            <button className="add-question-btn" onClick={addQuestion}>
              + Додати питання
            </button>
          </div>

          {/* Налаштування гри */}
          <div className="sidebar-section">
            <label className="field-label">Налаштування</label>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Час на питання</label>
                <select
                  className="creator-select"
                  value={questionTime}
                  onChange={e => setQuestionTime(Number(e.target.value))}
                >
                  <option value={10}>10 сек</option>
                  <option value={15}>15 сек</option>
                  <option value={20}>20 сек</option>
                  <option value={30}>30 сек</option>
                  <option value={45}>45 сек</option>
                  <option value={60}>60 сек</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Мін. гравців</label>
                <select
                  className="creator-select"
                  value={minPlayers}
                  onChange={e => setMinPlayers(Number(e.target.value))}
                >
                  {[1,2,3,4,5].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div className="setting-item setting-item-full">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoStart}
                    onChange={e => setAutoStart(e.target.checked)}
                  />
                  Автостарт при досягненні мін. гравців
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* ── ПРАВА КОЛОНКА: Редактор поточного питання ── */}
        <main className="creator-main">
          <div className="question-editor">
            <div className="editor-header">
              <h3>Питання {activeQuestion + 1} з {questions.length}</h3>
            </div>

            {/* Текст питання */}
            <div className="field-group">
              <label className="field-label">Текст питання</label>
              <textarea
                className="creator-textarea"
                placeholder="Введіть питання..."
                value={currentQ.question}
                onChange={e => updateQuestionText(activeQuestion, e.target.value)}
                rows={3}
                maxLength={300}
              />
            </div>

            {/* Варіанти відповідей */}
            <div className="field-group">
              <label className="field-label">Варіанти відповідей</label>
              <div className="answers-editor">
                {currentQ.answers.map((ans, ai) => (
                  <div
                    key={ai}
                    className={`answer-editor-row ${currentQ.correctAnswer === ai ? 'is-correct' : ''}`}
                  >
                    {/* Кнопка вибору правильної відповіді */}
                    <button
                      className="correct-toggle"
                      style={{ background: currentQ.correctAnswer === ai ? LETTER_COLORS[ai] : 'transparent', borderColor: LETTER_COLORS[ai] }}
                      onClick={() => setCorrectAnswer(activeQuestion, ai)}
                      title="Позначити як правильну"
                    >
                      {currentQ.correctAnswer === ai ? '✓' : LETTERS[ai]}
                    </button>

                    <input
                      className="creator-input answer-input"
                      type="text"
                      placeholder={`Відповідь ${LETTERS[ai]}...`}
                      value={ans}
                      onChange={e => updateAnswer(activeQuestion, ai, e.target.value)}
                      maxLength={150}
                    />
                  </div>
                ))}
              </div>
              <p className="field-hint">
                Натисни кнопку ліворуч щоб позначити правильну відповідь
              </p>
            </div>

            {/* Індивідуальний таймер питання */}
            <div className="field-group field-group-inline">
              <label className="field-label">Таймер цього питання (необов'язково)</label>
              <input
                className="creator-input timer-input"
                type="number"
                placeholder={`${questionTime} (з налаштувань)`}
                value={currentQ.timeLimit}
                onChange={e => updateTimeLimit(activeQuestion, e.target.value)}
                min={10}
                max={120}
              />
            </div>
          </div>

          {/* Помилка */}
          {error && <div className="creator-error">{error}</div>}

          {/* Кнопки дій */}
          <div className="creator-actions">
            <button
              className="btn-export"
              onClick={handleExportJSON}
              disabled={!title.trim() || questions.some(q => !q.question.trim())}
              title="Завантажити як JSON для папки quizzes/"
            >
              ⬇ Зберегти JSON
            </button>
            <button
              className="btn-create-room"
              onClick={handleCreateRoom}
              disabled={isCreating}
            >
              {isCreating ? '⏳ Створення...' : `🚀 Запустити квіз (${questions.length} питань)`}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

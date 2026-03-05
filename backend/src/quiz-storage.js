/**
 * quiz-storage.js - Завантаження квізів з диску
 *
 * Відповідає за:
 * - Сканування директорії quizzes/ для JSON файлів
 * - Завантаження та валідацію квізів
 * - Кешування завантажених квізів
 */

const fs = require('fs');
const path = require('path');
const { log } = require('./utils');

// Шлях до директорії з квізами (відносно кореня проєкту)
const QUIZZES_DIR = path.join(__dirname, '..', '..', 'quizzes');

/**
 * Завантажує всі квізи з директорії quizzes/
 *
 * Читає всі .json файли в директорії quizzes/ і повертає
 * масив валідних квізів. Невалідні файли пропускаються з попередженням.
 *
 * @returns {Array} Масив об'єктів квізів
 */
function loadAllQuizzes() {
  const quizzes = [];

  // Перевіряємо що директорія існує
  if (!fs.existsSync(QUIZZES_DIR)) {
    log('Storage', `Директорія quizzes/ не знайдена: ${QUIZZES_DIR}`);
    return quizzes;
  }

  // Читаємо всі файли в директорії
  const files = fs.readdirSync(QUIZZES_DIR).filter(f => f.endsWith('.json') && f !== 'README.json');

  for (const filename of files) {
    const filePath = path.join(QUIZZES_DIR, filename);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      const quiz = JSON.parse(raw);

      // Базова валідація
      if (!quiz.title || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
        log('Storage', `Пропускаємо невалідний квіз: ${filename}`);
        continue;
      }

      // Додаємо унікальний id якщо відсутній
      if (!quiz.id) {
        quiz.id = filename.replace('.json', '');
      }

      quizzes.push(quiz);
      log('Storage', `Завантажено квіз: "${quiz.title}" (${quiz.questions.length} питань)`);

    } catch (err) {
      log('Storage', `Помилка при завантаженні ${filename}: ${err.message}`);
    }
  }

  log('Storage', `Завантажено ${quizzes.length} квізів`);
  return quizzes;
}

/**
 * Завантажує один квіз за назвою файлу або id
 *
 * @param {string} quizId - ID квізу (назва файлу без .json)
 * @returns {Object|null} Об'єкт квізу або null якщо не знайдено
 */
function loadQuizById(quizId) {
  const filePath = path.join(QUIZZES_DIR, `${quizId}.json`);

  if (!fs.existsSync(filePath)) {
    log('Storage', `Квіз "${quizId}" не знайдено`);
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const quiz = JSON.parse(raw);
    if (!quiz.id) quiz.id = quizId;
    return quiz;
  } catch (err) {
    log('Storage', `Помилка при завантаженні квізу "${quizId}": ${err.message}`);
    return null;
  }
}

module.exports = { loadAllQuizzes, loadQuizById };

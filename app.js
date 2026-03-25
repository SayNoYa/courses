// ─── НАСТРОЙКИ ───────────────────────────────────────────────
// Вставь сюда URL своего Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Список вопросов — добавляй/меняй здесь
const QUESTIONS = [
  'Вопрос 1 (заменить)',
  'Вопрос 2 (заменить)',
  'Вопрос 3 (заменить)',
];
// ─────────────────────────────────────────────────────────────

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const form = document.getElementById('checkin-form');
const list = document.getElementById('questions-list');
const submitBtn = document.getElementById('submit-btn');
const successMsg = document.getElementById('success-msg');

// Получаем данные пользователя из Telegram
const user = tg.initDataUnsafe?.user || {};
const userName = user.username || user.first_name || 'unknown';
const userId = user.id || 'unknown';

// Рендерим вопросы
QUESTIONS.forEach((text, i) => {
  const item = document.createElement('label');
  item.className = 'question-item';
  item.innerHTML = `
    <input type="checkbox" name="q${i}" value="1" />
    <span class="checkbox-box"></span>
    <span class="question-label">${text}</span>
  `;

  item.addEventListener('click', () => {
    const cb = item.querySelector('input[type="checkbox"]');
    cb.checked = !cb.checked;
    item.classList.toggle('checked', cb.checked);
  });

  list.appendChild(item);
});

// Отправка формы
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = 'Отправляю...';

  // Собираем ответы
  const answers = QUESTIONS.map((text, i) => {
    const cb = form.querySelector(`input[name="q${i}"]`);
    return cb.checked ? '✅' : '❌';
  });

  const payload = {
    userId,
    userName,
    date: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
    answers,
    questions: QUESTIONS,
  };

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      // Google Apps Script требует text/plain для CORS
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(payload),
    });

    form.classList.add('hidden');
    successMsg.classList.remove('hidden');

    // Закрываем мини-апп через 2 секунды
    setTimeout(() => tg.close(), 2000);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Отправить';
    alert('Ошибка отправки. Попробуй ещё раз.');
    console.error(err);
  }
});

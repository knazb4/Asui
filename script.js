
 // Ас үй: кухонный таймер
// Результат — на странице и в консоли: F12 → Console
console.log('script.js подключен');

// ===== Основа: элементы страницы =====
const timeEl = document.querySelector('.time');
const statusEl = document.querySelector('.status');
const startBtn = document.querySelector('.start');
const pauseBtn = document.querySelector('.pause');
const resetBtn = document.querySelector('.reset');
const dishList = document.querySelector('.dish-list');
const toast = document.querySelector('.toast');

// ===== Основа: состояние =====
const state = {
  name: 'Проверка',
  total: 10,
  left: 10,
  dishes: [],
  nextId: 1,
};

// урок 26: секунды → «м:сс»
const formatTime = (sec) => {
  const min = Math.floor(sec / 60);
  return `${min}:${String(sec % 60).padStart(2, '0')}`;
};

// ===== Основа: render рисует табло и список блюд =====
// li не пересоздаем, а обновляем: список перерисовывается
// каждую секунду, и новый li «съел» бы клик по старому
function renderDishes() {
  state.dishes.forEach((dish, i) => {
    if (dishList.children.length === i) {
      dishList.append(document.createElement('li'));
    }
    const li = dishList.children[i];
    li.dataset.id = dish.id;
    li.textContent = `${dish.name} — ${formatTime(dish.left)}`;
    li.classList.toggle('paused', !dish.running && dish.left > 0);
    li.classList.toggle('done', dish.left === 0);
  });
}

function render() {
  timeEl.textContent = formatTime(state.left);
  renderDishes();
}

// ===== Урок 39 · шаг 1. setTimeout: сообщение на 3 секунды =====
// ===== Урок 39 · шаг 2. clearTimeout: отмена старого таймера =====
let toastId = null;

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  console.log('Сообщение:', text);

  clearTimeout(toastId);

  toastId = setTimeout(() => {
    toast.classList.remove('show');
    console.log('Сообщение скрыто');
    toastId = null;
  }, 3000);
}

// ===== Основа: выбор времени — уроки 35 и 37 =====
document.querySelector('.presets').addEventListener('click', (event) => {
  const btn = event.target.closest('.preset');
  if (btn === null) {
    return;
  }

  state.name = btn.dataset.name;
  state.total = Number(btn.dataset.sec);
  state.left = state.total;
  render();
  showToast(`Выбрано: ${state.name} — ${formatTime(state.left)}`);
});

// ===== Основа: добавить блюдо — время у него пока стоит =====
document.querySelector('.dish-add').addEventListener('click', (event) => {
  const btn = event.target.closest('.dish');
  if (btn === null) {
    return;
  }

  state.dishes.push({
    id: state.nextId,
    name: btn.dataset.name,
    left: Number(btn.dataset.sec),
    running: true,
  });

  state.nextId = state.nextId + 1;
  render();
  console.log('Блюд в списке:', state.dishes.length);
});

// ===== Урок 39 · шаг 3. setInterval: таймер пошёл =====
// ===== Урок 39 · шаг 4. clearInterval: стоп на нуле и сброс =====
let timerId = null;

function tick() {
  state.left = state.left - 1;
  render();

  if (state.left === 0) {
    clearInterval(timerId);
    statusEl.textContent = `${state.name}: готово!`;
    showToast(`${state.name}: время вышло!`);
  }
}

startBtn.addEventListener('click', () => {
  if (state.left === 0) {
    state.left = state.total;
    render();
  }

  timerId = setInterval(tick, 1000);
  statusEl.textContent = `Идет: ${state.name}`;
  console.log('Старт:', formatTime(state.left));
});

resetBtn.addEventListener('click', () => {
  clearInterval(timerId);
  state.left = state.total;
  render();
  statusEl.textContent = 'Выберите время';
  console.log('Сброс:', formatTime(state.left));
});

// ===== Запуск =====
render();

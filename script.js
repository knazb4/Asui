
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
// ===== Урок 39 · шаг 5. Пауза и защита от двойного старта =====
let timerId = null;

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function tick() {
  state.left = state.left - 1;
  render();

  if (state.left === 0) {
    stopTimer();
    statusEl.textContent = `${state.name}: готово!`;
    showToast(`${state.name}: время вышло!`);
  }
}

startBtn.addEventListener('click', () => {
  if (timerId !== null) {
    console.log('Уже идет');
    return;
  }

  if (state.left === 0) {
    state.left = state.total;
    render();
  }

  timerId = setInterval(tick, 1000);
  statusEl.textContent = `Идет: ${state.name}`;
  console.log('Старт:', formatTime(state.left));
});

pauseBtn.addEventListener('click', () => {
  stopTimer();
  statusEl.textContent = 'Пауза';
  console.log('Пауза:', formatTime(state.left));
});

resetBtn.addEventListener('click', () => {
  stopTimer();
  state.left = state.total;
  render();
  statusEl.textContent = 'Выберите время';
  console.log('Сброс:', formatTime(state.left));
});

// ===== Урок 39 · шаг 6. Все блюда: один интервал =====
function tickDishes() {
  state.dishes.forEach((dish) => {
    if (dish.running && dish.left > 0) {
      dish.left = dish.left - 1;

      if (dish.left === 0) {
        dish.running = false;
        showToast(`${dish.name}: готово!`);
      }
    }
  });

  render();
}

setInterval(tickDishes, 1000);

dishList.addEventListener('click', (event) => {
  const li = event.target.closest('li');

  if (li === null) {
    return;
  }

  const dish = state.dishes.find((d) => {
    return d.id === Number(li.dataset.id);
  });

  if (dish === undefined || dish.left === 0) {
    return;
  }

  dish.running = !dish.running;
  render();

  console.log(dish.name, dish.running ? 'идет' : 'на паузе');
});

// ===== Урок 39 · шаг 7. Цикл событий: занятая страница =====
const busyMsg = document.querySelector('.busy-msg');

document.querySelector('.busy').addEventListener('click', () => {
  busyMsg.textContent = 'Страница занята…';
  console.log('1. Клик: начинаем долгую работу');

  setTimeout(() => {
    console.log('3. Таймер 0 мс: стек освободился');
  }, 0);

  const end = Date.now() + 3000;

  while (Date.now() < end) {
    // 3 секунды стек занят: нет перерисовки, клики ждут
  }

  busyMsg.textContent = 'Готово: 3 секунды страница не отвечала';
  console.log('2. Долгая работа закончилась');
});

// ===== Запуск =====
render();
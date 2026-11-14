/**
 * ============================================================
 *  СМАРТ КУЗБАСС — Telegram Mini App
 *  Основной файл логики приложения
 * ============================================================
 *
 *  Как это работает (объяснение для новичка):
 *  1. HTML — это структура страницы (кнопки, поля, вкладки)
 *  2. CSS  — это внешний вид (цвета, отступы, скругления)
 *  3. JS   — это поведение: что происходит при нажатии,
 *            сохранение данных, карта, геолокация и т.д.
 *
 *  Мы используем:
 *  - localStorage  → данные сохраняются в браузере телефона
 *  - Geolocation API → определяем координаты пользователя
 *  - Leaflet       → рисуем интерактивную карту
 *  - Telegram WebApp → подстраиваемся под тему Telegram
 */

// ============================================================
// 1. ПОДКЛЮЧЕНИЕ К TELEGRAM
// ============================================================
// Telegram передаёт специальный объект window.Telegram.WebApp
// Через него можно узнать данные пользователя, закрыть окно и т.д.

const tg = window.Telegram?.WebApp;

if (tg) {
  // Раскрываем приложение на весь экран
  tg.expand();
  
  // Подстраиваем цвета под тему Telegram (светлая/тёмная)
  tg.setHeaderColor('#6B5CE7');
  tg.setBackgroundColor('#F5F7FB');
  
  // Говорим Telegram, что приложение готово
  tg.ready();
  
  console.log('Telegram WebApp подключён. Пользователь:', tg.initDataUnsafe?.user);
}

// ============================================================
// 2. ДАННЫЕ ПРИЛОЖЕНИЯ
// ============================================================
// Здесь мы храним все обращения. В реальном проекте они
// будут на сервере. Сейчас — в localStorage (память браузера).

const STORAGE_KEY = 'smart_kuzbass_appeals';
const PROFILE_KEY = 'smart_kuzbass_profile';

// Категории для красивого отображения
const CATEGORIES = {
  roads: 'Дороги и тротуары',
  lighting: 'Освещение',
  cleaning: 'Уборка и чистота',
  playgrounds: 'Детские площадки',
  utilities: 'Коммунальные услуги',
  other: 'Другое'
};

const STATUS_LABELS = {
  new: 'Новое',
  in_progress: 'В работе',
  done: 'Решено'
};

// Текущие координаты пользователя
let currentPosition = null;
let map = null;
let userMarker = null;
let appealMarkers = [];

// ============================================================
// 3. РАБОТА С ДАННЫМИ (localStorage)
// ============================================================
// localStorage — это как маленькая база данных внутри браузера.
// Данные не исчезают при закрытии приложения.

function getAppeals() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAppeals(appeals) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appeals));
}

function getProfile() {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : {
    name: '',
    phone: '',
    city: 'Кемерово',
    avatar: ''
  };
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ============================================================
// 4. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================================
// Это самая важная часть интерфейса.
// При нажатии на кнопку внизу мы:
// 1. Убираем класс "active" у всех вкладок
// 2. Добавляем его только к нужной

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab; // "map", "add", "feed", "profile"
    
    // Убираем активный класс у всех кнопок и вкладок
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Добавляем активный класс выбранным
    button.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Специальные действия при открытии вкладки
    if (tabName === 'map') {
      // Карта должна пересчитать размер, когда становится видимой
      setTimeout(() => {
        if (map) map.invalidateSize();
        locateUser();
      }, 100);
    }
    
    if (tabName === 'feed') {
      renderFeed();
    }
    
    if (tabName === 'profile') {
      loadProfile();
      updateStats();
    }
  });
});

// ============================================================
// 5. КАРТА (Leaflet)
// ============================================================
// Leaflet — бесплатная библиотека для карт.
// Мы подключаем её через CDN (ссылка в HTML).

function initMap() {
  // Создаём карту. Центр — примерно Кемерово
  map = L.map('map').setView([55.354, 86.087], 13);
  
  // Добавляем слой тайлов (картинки карты)
  // Используем OpenStreetMap — бесплатный и открытый
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
  
  // Когда карта готова — пытаемся найти пользователя
  locateUser();
}

function locateUser() {
  const statusEl = document.getElementById('location-status');
  
  if (!navigator.geolocation) {
    statusEl.textContent = 'Геолокация не поддерживается вашим устройством';
    return;
  }
  
  statusEl.textContent = 'Определение местоположения...';
  
  navigator.geolocation.getCurrentPosition(
    // Успех
    (position) => {
      const { latitude, longitude } = position.coords;
      currentPosition = { lat: latitude, lng: longitude };
      
      // Перемещаем карту к пользователю
      map.setView([latitude, longitude], 15);
      
      // Убираем старый маркер, если был
      if (userMarker) {
        map.removeLayer(userMarker);
      }
      
      // Ставим новый маркер
      userMarker = L.marker([latitude, longitude], {
        title: 'Вы здесь'
      }).addTo(map)
        .bindPopup('📍 Вы здесь')
        .openPopup();
      
      statusEl.textContent = `📍 Ваши координаты: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      
      // Обновляем текст в форме
      updateFormLocation();
      
      // Рисуем маркеры обращений
      renderAppealMarkers();
    },
    // Ошибка
    (error) => {
      console.error('Ошибка геолокации:', error);
      let message = 'Не удалось определить местоположение';
      
      if (error.code === 1) {
        message = 'Вы запретили доступ к геолокации. Разрешите в настройках браузера.';
      } else if (error.code === 2) {
        message = 'Местоположение недоступно. Проверьте GPS.';
      } else if (error.code === 3) {
        message = 'Превышено время ожидания. Попробуйте ещё раз.';
      }
      
      statusEl.textContent = message;
      
      // Если нет геолокации — ставим центр Кемерово
      if (!currentPosition) {
        currentPosition = { lat: 55.354, lng: 86.087 };
        map.setView([55.354, 86.087], 13);
      }
    },
    {
      enableHighAccuracy: true,  // Точнее (GPS)
      timeout: 10000,            // 10 секунд
      maximumAge: 60000          // Можно использовать кэш до 1 минуты
    }
  );
}

// Кнопка "Моё местоположение"
document.getElementById('btn-locate').addEventListener('click', locateUser);

// ============================================================
// 6. МАРКЕРЫ ОБРАЩЕНИЙ НА КАРТЕ
// ============================================================

function renderAppealMarkers() {
  // Удаляем старые маркеры
  appealMarkers.forEach(m => map.removeLayer(m));
  appealMarkers = [];
  
  const appeals = getAppeals();
  
  appeals.forEach(appeal => {
    if (!appeal.lat || !appeal.lng) return;
    
    // Цвет маркера зависит от статуса
    const color = appeal.status === 'done' ? 'green' :
                  appeal.status === 'in_progress' ? 'orange' : 'blue';
    
    const marker = L.circleMarker([appeal.lat, appeal.lng], {
      radius: 10,
      fillColor: color,
      color: '#fff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);
    
    marker.bindPopup(`
      <strong>${appeal.title}</strong><br>
      ${CATEGORIES[appeal.category] || appeal.category}<br>
      <em>${STATUS_LABELS[appeal.status]}</em>
    `);
    
    appealMarkers.push(marker);
  });
}

// ============================================================
// 7. ФОРМА ДОБАВЛЕНИЯ ОБРАЩЕНИЯ
// ============================================================

function updateFormLocation() {
  const el = document.getElementById('form-location');
  if (currentPosition) {
    el.textContent = `📍 ${currentPosition.lat.toFixed(5)}, ${currentPosition.lng.toFixed(5)}`;
  } else {
    el.textContent = 'Местоположение не определено. Нажмите «Обновить»';
  }
}

document.getElementById('btn-refresh-location').addEventListener('click', () => {
  locateUser();
});

// Предпросмотр фото
document.getElementById('appeal-photo').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById('photo-preview');
  
  if (!file) {
    preview.classList.add('hidden');
    preview.innerHTML = '';
    return;
  }
  
  // FileReader — читает файл и превращает его в картинку (base64)
  const reader = new FileReader();
  reader.onload = (event) => {
    preview.innerHTML = `<img src="${event.target.result}" alt="Фото">`;
    preview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
});

// Отправка формы
document.getElementById('appeal-form').addEventListener('submit', (e) => {
  e.preventDefault(); // Не перезагружаем страницу
  
  const category = document.getElementById('appeal-category').value;
  const title = document.getElementById('appeal-title').value.trim();
  const description = document.getElementById('appeal-description').value.trim();
  const photoInput = document.getElementById('appeal-photo');
  
  if (!category || !title || !description) {
    alert('Заполните все обязательные поля');
    return;
  }
  
  // Создаём объект обращения
  const appeal = {
    id: Date.now().toString(),           // Уникальный ID (время)
    category,
    title,
    description,
    status: 'new',
    createdAt: new Date().toISOString(),
    lat: currentPosition?.lat || null,
    lng: currentPosition?.lng || null,
    photo: null
  };
  
  // Если есть фото — сохраняем его как base64 (для прототипа)
  // В реальном приложении фото загружают на сервер
  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (event) => {
      appeal.photo = event.target.result;
      finishSubmit(appeal);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    finishSubmit(appeal);
  }
});

function finishSubmit(appeal) {
  // Сохраняем
  const appeals = getAppeals();
  appeals.unshift(appeal); // Добавляем в начало списка
  saveAppeals(appeals);
  
  // Показываем сообщение об успехе
  document.getElementById('appeal-form').classList.add('hidden');
  document.getElementById('form-success').classList.remove('hidden');
  
  // Очищаем форму через 2 секунды
  setTimeout(() => {
    document.getElementById('appeal-form').reset();
    document.getElementById('photo-preview').classList.add('hidden');
    document.getElementById('photo-preview').innerHTML = '';
    document.getElementById('appeal-form').classList.remove('hidden');
    document.getElementById('form-success').classList.add('hidden');
    
    // Переключаемся на ленту, чтобы пользователь увидел своё обращение
    document.querySelector('[data-tab="feed"]').click();
  }, 2000);
  
  // Обновляем маркеры на карте
  if (map) renderAppealMarkers();
}

// ============================================================
// 8. ЛЕНТА ОБРАЩЕНИЙ
// ============================================================

function renderFeed() {
  const list = document.getElementById('appeals-list');
  const filter = document.getElementById('feed-filter').value;
  
  let appeals = getAppeals();
  
  // Фильтрация
  if (filter !== 'all') {
    appeals = appeals.filter(a => a.status === filter);
  }
  
  if (appeals.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span>📭</span>
        <p>Пока нет обращений</p>
        <p style="font-size:13px; margin-top:8px;">Нажмите «Добавить», чтобы создать первое</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = appeals.map(appeal => {
    const date = new Date(appeal.createdAt);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <article class="appeal-card status-${appeal.status}">
        <div class="appeal-header">
          <h3 class="appeal-title">${escapeHtml(appeal.title)}</h3>
          <span class="appeal-status status-${appeal.status}">
            ${STATUS_LABELS[appeal.status]}
          </span>
        </div>
        <div class="appeal-meta">${dateStr}</div>
        <p class="appeal-desc">${escapeHtml(appeal.description)}</p>
        <span class="appeal-category">${CATEGORIES[appeal.category] || appeal.category}</span>
      </article>
    `;
  }).join('');
}

// Фильтр
document.getElementById('feed-filter').addEventListener('change', renderFeed);

// Защита от XSS (важная привычка)
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// 9. ПРОФИЛЬ
// ============================================================

function loadProfile() {
  const profile = getProfile();
  
  document.getElementById('profile-name').value = profile.name || '';
  document.getElementById('profile-phone').value = profile.phone || '';
  document.getElementById('profile-city').value = profile.city || 'Кемерово';
  
  const avatar = document.getElementById('profile-avatar');
  if (profile.avatar) {
    avatar.src = profile.avatar;
  } else if (tg?.initDataUnsafe?.user?.photo_url) {
    // Если есть фото из Telegram — используем его
    avatar.src = tg.initDataUnsafe.user.photo_url;
  }
  
  // Если пользователь пришёл из Telegram — подставляем имя
  if (!profile.name && tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    document.getElementById('profile-name').value = 
      [user.first_name, user.last_name].filter(Boolean).join(' ');
  }
}

document.getElementById('btn-save-profile').addEventListener('click', () => {
  const profile = {
    name: document.getElementById('profile-name').value.trim(),
    phone: document.getElementById('profile-phone').value.trim(),
    city: document.getElementById('profile-city').value.trim(),
    avatar: document.getElementById('profile-avatar').src
  };
  
  saveProfile(profile);
  
  // Визуальная обратная связь
  const btn = document.getElementById('btn-save-profile');
  const oldText = btn.textContent;
  btn.textContent = '✓ Сохранено';
  btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
  
  setTimeout(() => {
    btn.textContent = oldText;
    btn.style.background = '';
  }, 1500);
});

// Смена аватара
document.getElementById('btn-change-avatar').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('profile-avatar').src = event.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  input.click();
});

function updateStats() {
  const appeals = getAppeals();
  document.getElementById('stat-appeals').textContent = appeals.length;
  document.getElementById('stat-resolved').textContent = 
    appeals.filter(a => a.status === 'done').length;
}

// Очистка данных (для тестирования)
document.getElementById('btn-clear-data').addEventListener('click', () => {
  if (confirm('Удалить все обращения и данные профиля? Это нельзя отменить.')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    renderFeed();
    updateStats();
    loadProfile();
    if (map) renderAppealMarkers();
    alert('Данные очищены');
  }
});

// ============================================================
// 10. ДЕМО-ДАННЫЕ (чтобы лента не была пустой при первом запуске)
// ============================================================

function seedDemoData() {
  const appeals = getAppeals();
  if (appeals.length > 0) return; // Уже есть данные
  
  const demo = [
    {
      id: '1',
      category: 'roads',
      title: 'Глубокая яма на ул. Ленина',
      description: 'Около дома 45 образовалась большая яма после дождей. Опасно для машин и пешеходов.',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      lat: 55.355,
      lng: 86.090
    },
    {
      id: '2',
      category: 'lighting',
      title: 'Не работает фонарь во дворе',
      description: 'Фонарь около подъезда 3 дома 12 по ул. Советской не горит уже неделю.',
      status: 'new',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      lat: 55.350,
      lng: 86.085
    },
    {
      id: '3',
      category: 'playgrounds',
      title: 'Сломана качель на детской площадке',
      description: 'На площадке во дворе дома 8 одна качель оторвана. Дети могут получить травму.',
      status: 'done',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      lat: 55.360,
      lng: 86.095
    }
  ];
  
  saveAppeals(demo);
}

// ============================================================
// 11. ЗАПУСК ПРИЛОЖЕНИЯ
// ============================================================

// Когда страница полностью загрузилась
document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();   // Добавляем демо-данные, если пусто
  initMap();        // Создаём карту
  renderFeed();     // Рисуем ленту
  loadProfile();    // Загружаем профиль
  updateStats();    // Обновляем счётчики
});

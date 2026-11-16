/**
 * СМАРТ КУЗБАСС — Telegram Mini App
 * Обновлённая версия с авторизацией, исправлениями фото и интерфейса
 */

const tg = window.Telegram?.WebApp;

if (tg) {
  tg.expand();
  tg.setHeaderColor('#6B5CE7');
  tg.setBackgroundColor('#F5F7FB');
  tg.ready();
}

const STORAGE_KEY = 'smart_kuzbass_appeals';
const PROFILE_KEY = 'smart_kuzbass_profile';
const USERS_KEY = 'smart_kuzbass_users';
const SESSION_KEY = 'smart_kuzbass_session';

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

let currentPosition = null;
let map = null;
let userMarker = null;
let appealMarkers = [];

// ============================================================
// ХРАНИЛИЩЕ
// ============================================================

function getAppeals() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAppeals(appeals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appeals));
    return true;
  } catch (e) {
    console.error('Не удалось сохранить обращения', e);
    // Если переполнили localStorage — убираем фото у старых
    const cleaned = appeals.map((a, i) => {
      if (i > 15) return { ...a, photo: null };
      return a;
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      return true;
    } catch {
      alert('Не хватает места для сохранения. Удалите старые обращения.');
      return false;
    }
  }
}

function getProfile() {
  try {
    const data = localStorage.getItem(PROFILE_KEY);
    return data ? JSON.parse(data) : { name: '', phone: '', city: 'Кемерово', avatar: '' };
  } catch {
    return { name: '', phone: '', city: 'Кемерово', avatar: '' };
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getSession() {
  return localStorage.getItem(SESSION_KEY);
}

function setSession(phone) {
  localStorage.setItem(SESSION_KEY, phone);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ============================================================
// АВТОРИЗАЦИЯ
// ============================================================

function showAuth() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
}

function showApp() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  // После показа приложения инициализируем карту, если ещё нет
  setTimeout(() => {
    if (!map) initMap();
    else map.invalidateSize();
  }, 150);
}

function checkAuth() {
  const session = getSession();
  if (session) {
    showApp();
    loadProfile();
  } else {
    showAuth();
  }
}

// Переключение вкладок Вход / Регистрация
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.auth;
    document.getElementById('login-form').classList.toggle('hidden', mode !== 'login');
    document.getElementById('register-form').classList.toggle('hidden', mode !== 'register');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('register-error').classList.add('hidden');
  });
});

// Регистрация
document.getElementById('register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const city = document.getElementById('reg-city').value.trim() || 'Кемерово';
  const password = document.getElementById('reg-password').value;

  const errorEl = document.getElementById('register-error');
  errorEl.classList.add('hidden');

  if (!name || !phone || !password) {
    errorEl.textContent = 'Заполните все поля';
    errorEl.classList.remove('hidden');
    return;
  }

  const users = getUsers();
  if (users[phone]) {
    errorEl.textContent = 'Этот номер уже зарегистрирован. Войдите.';
    errorEl.classList.remove('hidden');
    return;
  }

  users[phone] = { name, phone, city, password, avatar: '' };
  saveUsers(users);

  // Сразу сохраняем профиль и сессию
  saveProfile({ name, phone, city, avatar: '' });
  setSession(phone);

  showApp();
  loadProfile();
});

// Вход
document.getElementById('login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const phone = document.getElementById('login-phone').value.trim();
  const password = document.getElementById('login-password').value;

  const errorEl = document.getElementById('login-error');
  errorEl.classList.add('hidden');

  const users = getUsers();
  const user = users[phone];

  if (!user || user.password !== password) {
    errorEl.textContent = 'Неверный номер или пароль';
    errorEl.classList.remove('hidden');
    return;
  }

  saveProfile({
    name: user.name,
    phone: user.phone,
    city: user.city || 'Кемерово',
    avatar: user.avatar || ''
  });
  setSession(phone);

  showApp();
  loadProfile();
});

// Выход
document.getElementById('btn-logout').addEventListener('click', () => {
  if (confirm('Выйти из профиля?')) {
    clearSession();
    showAuth();
    // Сбрасываем формы
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
  }
});

// ============================================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================================

document.querySelectorAll('.nav-item').forEach(button => {
  button.addEventListener('click', () => {
    const tabName = button.dataset.tab;

    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    button.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');

    if (tabName === 'map') {
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
          locateUser();
        }
      }, 100);
    }

    if (tabName === 'feed') {
      renderFeed();
    }

    if (tabName === 'profile') {
      loadProfile();
    }
  });
});

// ============================================================
// КАРТА
// ============================================================

function initMap() {
  if (map) return;

  map = L.map('map', {
    zoomControl: false,      // убираем +/-
    attributionControl: false // убираем водяной знак
  }).setView([55.354, 86.087], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);

  locateUser();
}

function locateUser() {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      currentPosition = { lat: latitude, lng: longitude };

      if (map) {
        map.setView([latitude, longitude], 15);

        if (userMarker) map.removeLayer(userMarker);

        userMarker = L.marker([latitude, longitude], { title: 'Вы здесь' })
          .addTo(map)
          .bindPopup('Это вы')
          .openPopup();

        renderAppealMarkers();
      }
    },
    (error) => {
      console.error('Геолокация:', error);
      if (!currentPosition) {
        currentPosition = { lat: 55.354, lng: 86.087 };
        if (map) map.setView([55.354, 86.087], 13);
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

document.getElementById('btn-locate').addEventListener('click', locateUser);

function renderAppealMarkers() {
  if (!map) return;
  appealMarkers.forEach(m => map.removeLayer(m));
  appealMarkers = [];

  getAppeals().forEach(appeal => {
    if (!appeal.lat || !appeal.lng) return;

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
      <strong>${escapeHtml(appeal.title)}</strong><br>
      ${CATEGORIES[appeal.category] || appeal.category}<br>
      <em>${STATUS_LABELS[appeal.status]}</em>
    `);

    appealMarkers.push(marker);
  });
}

// ============================================================
// СЖАТИЕ ФОТО (чтобы не падало сохранение)
// ============================================================

function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// ФОРМА ОБРАЩЕНИЯ
// ============================================================

document.getElementById('appeal-photo').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const preview = document.getElementById('photo-preview');

  if (!file) {
    preview.classList.add('hidden');
    preview.innerHTML = '';
    return;
  }

  try {
    const compressed = await compressImage(file, 600, 0.65);
    preview.innerHTML = `<img src="${compressed}" alt="Фото">`;
    preview.classList.remove('hidden');
    // Сохраняем сжатое фото во временное свойство
    preview.dataset.compressed = compressed;
  } catch {
    alert('Не удалось загрузить фото');
  }
});

document.getElementById('appeal-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const category = document.getElementById('appeal-category').value;
  const title = document.getElementById('appeal-title').value.trim();
  const description = document.getElementById('appeal-description').value.trim();
  const photoInput = document.getElementById('appeal-photo');
  const preview = document.getElementById('photo-preview');

  if (!category || !title || !description) {
    alert('Заполните все обязательные поля');
    return;
  }

  let photo = null;

  // Берём уже сжатое фото из превью, если есть
  if (preview.dataset.compressed) {
    photo = preview.dataset.compressed;
  } else if (photoInput.files[0]) {
    try {
      photo = await compressImage(photoInput.files[0], 600, 0.65);
    } catch {
      alert('Не удалось обработать фото. Отправляем без фото.');
    }
  }

  const appeal = {
    id: Date.now().toString(),
    category,
    title,
    description,
    status: 'new',
    createdAt: new Date().toISOString(),
    lat: currentPosition?.lat || null,
    lng: currentPosition?.lng || null,
    photo
  };

  const ok = finishSubmit(appeal);
  if (!ok) return;
});

function finishSubmit(appeal) {
  const appeals = getAppeals();
  appeals.unshift(appeal);
  const saved = saveAppeals(appeals);
  if (!saved) return false;

  document.getElementById('appeal-form').classList.add('hidden');
  document.getElementById('form-success').classList.remove('hidden');

  setTimeout(() => {
    document.getElementById('appeal-form').reset();
    const preview = document.getElementById('photo-preview');
    preview.classList.add('hidden');
    preview.innerHTML = '';
    delete preview.dataset.compressed;

    document.getElementById('appeal-form').classList.remove('hidden');
    document.getElementById('form-success').classList.add('hidden');

    document.querySelector('[data-tab="feed"]').click();
  }, 1800);

  if (map) renderAppealMarkers();
  return true;
}

// ============================================================
// ЛЕНТА
// ============================================================

function renderFeed() {
  const list = document.getElementById('appeals-list');
  const filter = document.getElementById('feed-filter').value;

  let appeals = getAppeals();
  if (filter !== 'all') {
    appeals = appeals.filter(a => a.status === filter);
  }

  if (appeals.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <p>Пока нет обращений</p>
        <p style="font-size:13px; margin-top:8px;">Значит, всё хорошо :)</p>
        <img src="img/open.png" class="nav-icon-img-big" alt="" style="margin-top:12px;">
      </div>
    `;
    return;
  }

  list.innerHTML = appeals.map(appeal => {
    const date = new Date(appeal.createdAt);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const photoHtml = appeal.photo
      ? `<div class="appeal-photo"><img src="${appeal.photo}" alt="Фото"></div>`
      : '';

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
        ${photoHtml}
      </article>
    `;
  }).join('');
}

document.getElementById('feed-filter').addEventListener('change', renderFeed);

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// ПРОФИЛЬ
// ============================================================

function loadProfile() {
  const profile = getProfile();

  document.getElementById('profile-name').value = profile.name || '';
  document.getElementById('profile-phone').value = profile.phone || '';
  document.getElementById('profile-city').value = profile.city || 'Кемерово';

  // Имя под фото
  document.getElementById('profile-display-name').textContent =
    profile.name || 'Пользователь';

  const avatar = document.getElementById('profile-avatar');
  if (profile.avatar) {
    avatar.src = profile.avatar;
  } else if (tg?.initDataUnsafe?.user?.photo_url) {
    avatar.src = tg.initDataUnsafe.user.photo_url;
  } else {
    avatar.src = 'img/user.png';
  }
}

// Кнопка «Редактировать данные»
document.getElementById('btn-edit-profile').addEventListener('click', () => {
  const block = document.getElementById('profile-edit-block');
  block.classList.toggle('hidden');
});

// Сохранение профиля
document.getElementById('btn-save-profile').addEventListener('click', () => {
  const profile = {
    name: document.getElementById('profile-name').value.trim(),
    phone: document.getElementById('profile-phone').value.trim(),
    city: document.getElementById('profile-city').value.trim(),
    avatar: document.getElementById('profile-avatar').src
  };

  if (!profile.name) {
    alert('Укажите имя');
    return;
  }

  saveProfile(profile);

  // Обновляем и в списке пользователей
  const users = getUsers();
  const session = getSession();
  if (session && users[session]) {
    users[session].name = profile.name;
    users[session].city = profile.city;
    users[session].avatar = profile.avatar;
    // телефон не меняем — он ключ
    saveUsers(users);
  }

  document.getElementById('profile-display-name').textContent = profile.name;
  document.getElementById('profile-edit-block').classList.add('hidden');

  const btn = document.getElementById('btn-save-profile');
  const old = btn.textContent;
  btn.textContent = '✓ Сохранено';
  setTimeout(() => { btn.textContent = old; }, 1200);
});

// Смена аватара
document.getElementById('btn-change-avatar').addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file, 300, 0.7);
      document.getElementById('profile-avatar').src = compressed;
    } catch {
      alert('Не удалось загрузить фото');
    }
  };

  input.click();
});

// ============================================================
// ЗАПУСК
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Демо-данные только если совсем пусто
  if (getAppeals().length === 0) {
    saveAppeals([
      {
        id: '1',
        category: 'roads',
        title: 'Глубокая яма на ул. Ленина',
        description: 'Около дома 45 образовалась большая яма после дождей.',
        status: 'in_progress',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        lat: 55.355,
        lng: 86.090,
        photo: null
      },
      {
        id: '2',
        category: 'lighting',
        title: 'Не работает фонарь во дворе',
        description: 'Фонарь около подъезда 3 дома 12 не горит уже неделю.',
        status: 'new',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        lat: 55.350,
        lng: 86.085,
        photo: null
      }
    ]);
  }

  checkAuth();
});

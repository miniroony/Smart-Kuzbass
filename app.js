/* ===== Smart Kuzbass App v2 ===== */

// ===== Data =====
let appeals = JSON.parse(localStorage.getItem("sk_appeals") || "null") || [
    {
        id: 1,
        title: "Большая яма на проезжей части",
        category: "Дороги",
        address: "ул. Советская, 45, Кемерово",
        description: "Глубокая яма около перекрёстка. Уже несколько машин повредили подвеску.",
        status: "work",
        stars: 28,
        starredBy: [],
        comments: [
            { id: 1, authorPhone: "79001112233", authorName: "Ирина М.", text: "Да, вчера сам чуть не влетел!", time: "2026-11-18T14:30:00" },
            { id: 2, authorPhone: "admin", authorName: "Администрация", text: "Заявка принята, ремонт на следующей неделе.", time: "2026-11-19T09:15:00" }
        ],
        lat: 55.3542, lng: 86.0873,
        date: "2026-11-18T10:20:00",
        ownerPhone: "79001112233"
    },
    {
        id: 2,
        title: "Не работает освещение во дворе",
        category: "Освещение",
        address: "пр. Ленина, 12к2, Кемерово",
        description: "Три фонаря не горят уже больше месяца. Во дворе очень темно вечером.",
        status: "new",
        stars: 15,
        starredBy: [],
        comments: [
            { id: 1, authorPhone: "79004445566", authorName: "Сергей П.", text: "Поддерживаю, ходим с фонариками.", time: "2026-11-19T18:00:00" }
        ],
        lat: 55.3410, lng: 86.1021,
        date: "2026-11-19T12:00:00",
        ownerPhone: "79004445566"
    },
    {
        id: 3,
        title: "Переполненные мусорные контейнеры",
        category: "Мусор",
        address: "ул. Кирова, 78, Кемерово",
        description: "Контейнеры не вывозят уже 5 дней. Мусор разлетается по двору.",
        status: "done",
        stars: 42,
        starredBy: [],
        comments: [
            { id: 1, authorPhone: "79007778899", authorName: "Ольга В.", text: "Наконец-то вывезли сегодня утром!", time: "2026-11-16T08:40:00" }
        ],
        lat: 55.3689, lng: 86.0654,
        date: "2026-11-15T09:00:00",
        ownerPhone: "79007778899"
    },
    {
        id: 4,
        title: "Сломанная детская площадка",
        category: "Благоустройство",
        address: "ул. Весенняя, 5, Кемерово",
        description: "Качели сломаны, горка с острыми краями. Дети могут травмироваться.",
        status: "work",
        stars: 19,
        starredBy: [],
        comments: [],
        lat: 55.3298, lng: 86.1145,
        date: "2026-11-17T16:30:00",
        ownerPhone: "79001112233"
    },
    {
        id: 5,
        title: "Проблемы с отоплением",
        category: "ЖКХ",
        address: "ул. Шахтёров, 33, Кемерово",
        description: "В подъезде очень холодно, батареи едва тёплые.",
        status: "new",
        stars: 33,
        starredBy: [],
        comments: [
            { id: 1, authorPhone: "79002223344", authorName: "Мария К.", text: "У нас то же самое, уже писали в УК.", time: "2026-11-20T11:00:00" }
        ],
        lat: 55.3756, lng: 86.0912,
        date: "2026-11-20T07:45:00",
        ownerPhone: "79002223344"
    },
    {
        id: 6,
        title: "Остановка без павильона",
        category: "Транспорт",
        address: "пр. Металлургов, 25, Новокузнецк",
        description: "На остановке нет навеса. В дождь и снег негде укрыться.",
        status: "new",
        stars: 11,
        starredBy: [],
        comments: [],
        lat: 53.7596, lng: 87.1216,
        date: "2026-11-21T13:20:00",
        ownerPhone: "79003334455"
    },
    {
        id: 7,
        title: "Разбитый тротуар",
        category: "Дороги",
        address: "ул. Дзержинского, 8, Кемерово",
        description: "Тротуар в ужасном состоянии, плитка вся разбита.",
        status: "work",
        stars: 22,
        starredBy: [],
        comments: [
            { id: 1, authorPhone: "79005556677", authorName: "Пенсионер", text: "Уже год как в таком состоянии.", time: "2026-11-16T15:00:00" }
        ],
        lat: 55.3511, lng: 86.0789,
        date: "2026-11-16T10:00:00",
        ownerPhone: "79005556677"
    },
    {
        id: 8,
        title: "Стихийная свалка у леса",
        category: "Мусор",
        address: "около ул. Тухачевского, Кемерово",
        description: "Кто-то постоянно выбрасывает строительный мусор.",
        status: "new",
        stars: 37,
        starredBy: [],
        comments: [
            { id: 1, authorPhone: "79006667788", authorName: "Эколог", text: "Это уже экологическая проблема.", time: "2026-11-14T19:30:00" },
            { id: 2, authorPhone: "79008889900", authorName: "Житель", text: "Поддерживаю, надо наказывать.", time: "2026-11-15T08:00:00" }
        ],
        lat: 55.3387, lng: 86.0956,
        date: "2026-11-14T17:00:00",
        ownerPhone: "79006667788"
    }
];

// ===== State =====
let currentUser = JSON.parse(localStorage.getItem("sk_user") || "null");
let currentTab = "main";
let lentaMode = "all";
let map = null;
let markersLayer = null;
let userLat = 55.354;
let userLng = 86.087;
let currentGeo = null;

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initAuth();
    if (currentUser) {
        showApp();
    }
});

function showApp() {
    document.getElementById("authScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    updateProfileUI();
    initNav();
    initMap();
    renderAppeals();
    initFilters();
    initModals();
    initForms();
    // Всегда начинаем с главного экрана (карта)
    currentTab = "main";
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === "main"));
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.toggle("active", s.id === "screen-main");
    });
    updateHeaderForTab("main");
    getGeolocation();
}

// ===== Auth =====
function initAuth() {
    document.querySelectorAll(".auth-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            const isLogin = tab.dataset.auth === "login";
            document.getElementById("formLogin").style.display = isLogin ? "block" : "none";
            document.getElementById("formRegister").style.display = isLogin ? "none" : "block";
        });
    });

    document.getElementById("formLogin").addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = normalizePhone(e.target.phone.value);
        const pass = e.target.password.value;
        const users = JSON.parse(localStorage.getItem("sk_users") || "{}");
        if (users[phone] && users[phone].password === pass) {
            currentUser = { phone, name: users[phone].name, avatar: users[phone].avatar || null };
            localStorage.setItem("sk_user", JSON.stringify(currentUser));
            showApp();
            showToast("Добро пожаловать!");
        } else {
            showToast("Неверный телефон или пароль");
        }
    });

    document.getElementById("formRegister").addEventListener("submit", (e) => {
        e.preventDefault();
        const phone = normalizePhone(e.target.phone.value);
        const name = e.target.name.value.trim();
        const pass = e.target.password.value;
        const users = JSON.parse(localStorage.getItem("sk_users") || "{}");
        if (users[phone]) {
            showToast("Этот номер уже зарегистрирован");
            return;
        }
        users[phone] = { name, password: pass, avatar: null };
        localStorage.setItem("sk_users", JSON.stringify(users));
        currentUser = { phone, name, avatar: null };
        localStorage.setItem("sk_user", JSON.stringify(currentUser));
        showApp();
        showToast("Регистрация успешна!");
    });
}

function normalizePhone(p) {
    return p.replace(/\D/g, "").replace(/^8/, "7");
}

function logout() {
    currentUser = null;
    localStorage.removeItem("sk_user");
    document.getElementById("app").classList.add("hidden");
    document.getElementById("authScreen").classList.remove("hidden");
    if (map) { map.destroy(); map = null; }
}

// ===== Theme =====
function initTheme() {
    const saved = localStorage.getItem("sk_theme") || "light";
    setTheme(saved);
    document.getElementById("themeToggle").addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setTheme(next);
    });
    // Notifications near theme toggle
    const notifBtn = document.getElementById("btnNotifications");
    if (notifBtn) {
        notifBtn.addEventListener("click", () => {
            showToast("Нет новых уведомлений");
            const badge = document.getElementById("notifBadge");
            if (badge) badge.style.display = "none";
        });
    }
}
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("sk_theme", theme);
    document.getElementById("themeIcon").src = theme === "dark" ? "img/sun.png" : "img/moon.png";
}

// ===== Navigation =====
function initNav() {
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });
}
function switchTab(tab) {
    if (tab === currentTab) return;
    currentTab = tab;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".screen").forEach(s => {
        s.classList.toggle("active", s.id === `screen-${tab}`);
    });
    updateHeaderForTab(tab);
    if (tab === "main" && map) setTimeout(() => map.container.fitToViewport(), 300);
    if (tab === "lenta") renderAppeals();
    if (tab === "profile") updateProfileUI();
}

function updateHeaderForTab(tab) {
    const wrap = document.getElementById("headerSearchWrap");
    if (!wrap) return;
    if (tab === "main") {
        wrap.classList.add("visible");
    } else {
        wrap.classList.remove("visible");
    }
}

// ===== Geolocation + Yandex =====
let mapIdleTimer = null;
let isMapMoving = false;

function getGeolocation(centerMap = true) {
    if (!navigator.geolocation) {
        currentGeo = { lat: 55.354, lng: 86.087, address: "Кемерово" };
        showToast("Геолокация недоступна");
        return;
    }
    showToast("Определяем местоположение...");
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            userLat = pos.coords.latitude;
            userLng = pos.coords.longitude;
            currentGeo = { lat: userLat, lng: userLng, address: "Определяем адрес..." };
            if (map && centerMap) {
                map.setCenter([userLat, userLng], 16, { duration: 400 });
            }
            reverseGeocode(userLat, userLng);
        },
        () => {
            currentGeo = { lat: 55.354, lng: 86.087, address: "Кемерово" };
            showToast("Не удалось определить местоположение");
        },
        { enableHighAccuracy: true, timeout: 12000 }
    );
}

function formatNominatimAddress(data) {
    if (!data) return null;
    const a = data.address || {};
    const street = a.road || a.pedestrian || a.residential || a.street || "";
    const house = a.house_number || "";
    const city = a.city || a.town || a.village || a.municipality || a.county || "";
    if (street) {
        return street + (house ? ", " + house : "") + (city ? ", " + city : "");
    }
    if (data.display_name) {
        // берём первые 3 части
        return data.display_name.split(",").slice(0, 3).map(s => s.trim()).join(", ");
    }
    return null;
}

function nominatimReverse(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ru&addressdetails=1`;
    return fetch(url, { headers: { "Accept": "application/json" } })
        .then(r => r.ok ? r.json() : null)
        .then(data => formatNominatimAddress(data))
        .catch(() => null);
}

function nominatimSearch(query) {
    const q = encodeURIComponent(query);
    // Поиск по всему миру
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&accept-language=ru&addressdetails=1&limit=8`;
    return fetch(url, { headers: { "Accept": "application/json" } })
        .then(r => r.ok ? r.json() : [])
        .then(list => (list || []).map(item => ({
            text: formatNominatimAddress(item) || item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        })))
        .catch(() => []);
}

function yandexReverse(lat, lng) {
    if (typeof ymaps === "undefined" || !ymaps.geocode) return Promise.resolve(null);
    return ymaps.geocode([lat, lng], { results: 1 }).then((res) => {
        const first = res.geoObjects.get(0);
        if (!first) return null;
        let address = first.getAddressLine() || "";
        try {
            const components = first.properties.get("metaDataProperty.GeocoderMetaData.Address.Components") || [];
            const street = (components.find(c => c.kind === "street") || {}).name;
            const house = (components.find(c => c.kind === "house") || {}).name;
            const locality = (components.find(c => c.kind === "locality") || components.find(c => c.kind === "area") || {}).name;
            if (street) address = street + (house ? ", " + house : "") + (locality ? ", " + locality : "");
        } catch (e) {}
        return address || null;
    }).catch(() => null);
}

function reverseGeocode(lat, lng) {
    currentGeo = { lat, lng, address: currentGeo?.address || "Определяем адрес..." };
    updateAddressFields();

    // 1) Яндекс, 2) OpenStreetMap — что ответит первым с нормальным адресом
    const apply = (addr) => {
        if (addr && addr.length > 3) {
            currentGeo = { lat, lng, address: addr };
            updateAddressFields();
            return true;
        }
        return false;
    };

    yandexReverse(lat, lng).then((addr) => {
        if (apply(addr)) return;
        return nominatimReverse(lat, lng).then((addr2) => {
            if (!apply(addr2)) {
                currentGeo = { lat, lng, address: `Точка ${lat.toFixed(5)}, ${lng.toFixed(5)}` };
                updateAddressFields();
            }
        });
    }).catch(() => {
        nominatimReverse(lat, lng).then((addr) => {
            if (!apply(addr)) {
                currentGeo = { lat, lng, address: `Точка ${lat.toFixed(5)}, ${lng.toFixed(5)}` };
                updateAddressFields();
            }
        });
    });
}

function updateAddressFields() {
    const input = document.getElementById("appealAddress");
    if (input && currentGeo) input.value = currentGeo.address;
    const status = document.getElementById("geoStatus");
    if (status && currentGeo) status.textContent = "📍 " + currentGeo.address;
}

function getMapCenterCoords() {
    if (!map) return null;
    const c = map.getCenter();
    return { lat: c[0], lng: c[1] };
}

function onMapAction() {
    // Карта двигается — прячем кнопку и поднимаем метку
    isMapMoving = true;
    document.getElementById("mapSubmitWrap")?.classList.remove("visible");
    document.querySelector(".center-pin")?.classList.add("dragging");

    clearTimeout(mapIdleTimer);
    mapIdleTimer = setTimeout(() => {
        isMapMoving = false;
        document.querySelector(".center-pin")?.classList.remove("dragging");
        // Обновляем координаты центра и адрес
        const coords = getMapCenterCoords();
        if (coords) {
            reverseGeocode(coords.lat, coords.lng);
        }
        // Показываем кнопку «Подать обращение»
        document.getElementById("mapSubmitWrap")?.classList.add("visible");
    }, 400);
}

// ===== Yandex Map =====
function initMap() {
    if (typeof ymaps === "undefined") {
        // API ещё грузится — подождём немного и повторим
        setTimeout(initMap, 200);
        return;
    }
    ymaps.ready(() => {
        // Сразу рисуем карту с дефолтным центром (Кемерово) — без ожидания геолокации
        const startCenter = currentGeo
            ? [currentGeo.lat, currentGeo.lng]
            : [userLat || 55.354, userLng || 86.087];

        map = new ymaps.Map("map", {
            center: startCenter,
            zoom: 14,
            controls: [],
            type: "yandex#map"
        }, {
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
            autoFitToViewport: "always"
        });

        markersLayer = new ymaps.GeoObjectCollection(null, {});
        map.geoObjects.add(markersLayer);
        renderMarkers();

        // События движения карты
        map.events.add("actionbegin", onMapAction);
        map.events.add("actiontick", onMapAction);
        map.events.add("boundschange", () => {
            if (!isMapMoving) onMapAction();
        });

        // Кнопка «Подать» сразу
        document.getElementById("mapSubmitWrap")?.classList.add("visible");
        const coords = getMapCenterCoords();
        if (coords) reverseGeocode(coords.lat, coords.lng);

        // Кнопка «Где я»
        document.getElementById("btnGeo")?.addEventListener("click", () => {
            getGeolocation(true);
        });

        // Геолокацию запрашиваем после отрисовки карты (не блокирует)
        if (!currentGeo) {
            setTimeout(() => getGeolocation(true), 300);
        }
    });
}

function renderMarkers() {
    if (!markersLayer) return;
    markersLayer.removeAll();

    appeals.forEach(a => {
        const placemark = new ymaps.Placemark(
            [a.lat, a.lng],
            {
                balloonContentHeader: a.title,
                balloonContentBody: `
                    <div style="font-size:13px;color:#666;margin:4px 0">${a.address}</div>
                    <div style="color:#f5a623;margin-bottom:8px">★ ${a.stars}</div>
                    <button onclick="openDetail(${a.id})" style="
                        padding:6px 12px;background:#5b5fc7;color:white;
                        border:none;border-radius:8px;cursor:pointer;font-size:13px;
                    ">Подробнее</button>
                `,
                hintContent: a.title
            },
            {
                iconLayout: "default#image",
                iconImageHref: "img/mesto.png",
                iconImageSize: [36, 36],
                iconImageOffset: [-18, -36]
            }
        );
        markersLayer.add(placemark);
    });
}

// ===== Appeals list =====
function renderAppeals() {
    const list = document.getElementById("appealsList");
    let data = [...appeals];

    if (lentaMode === "my" && currentUser) {
        data = data.filter(a => a.ownerPhone === currentUser.phone);
    }

    const cat = document.getElementById("filterCategory")?.value;
    if (cat) data = data.filter(a => a.category === cat);

    data.sort((a, b) => score(b) - score(a));

    if (!data.length) {
        list.innerHTML = `<div class="empty-state" style="height:auto;padding:40px 0"><p>Нет обращений</p></div>`;
        return;
    }

    list.innerHTML = data.map(a => {
        const isMine = currentUser && a.ownerPhone === currentUser.phone;
        return `
        <article class="appeal-card" data-id="${a.id}">
            <div class="appeal-top">
                <span class="appeal-category">${a.category}</span>
                <span class="appeal-status status-${a.status}">${statusText(a.status)}</span>
            </div>
            <h3 class="appeal-title">${a.title}</h3>
            <p class="appeal-meta">${formatDateTime(a.date)}</p>
            <p class="appeal-address">📍 ${a.address}</p>
            <p class="appeal-desc">${a.description}</p>
            <div class="appeal-footer">
                <button class="star-btn ${a.starredBy.includes(currentUser?.phone) ? "starred" : ""}" data-star="${a.id}">
                    <img src="img/star.png" alt="★">
                    <span>${a.stars}</span>
                </button>
                <span class="comment-count"><img src="img/comment.png" alt="" class="comment-icon"> ${a.comments.length}</span>
            </div>
            ${isMine && lentaMode === "my" ? `
            <div class="appeal-actions">
                <button class="btn-small danger" onclick="event.stopPropagation();deleteAppeal(${a.id})">Удалить</button>
            </div>` : ""}
        </article>`;
    }).join("");

    list.querySelectorAll(".appeal-card").forEach(card => {
        card.addEventListener("click", (e) => {
            if (e.target.closest(".star-btn") || e.target.closest(".btn-small")) return;
            openDetail(+card.dataset.id);
        });
    });
    list.querySelectorAll(".star-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            toggleStar(+btn.dataset.star, btn);
        });
    });
}

function score(a) {
    return a.stars * 1 + a.comments.length * 0.5;
}

function statusText(s) {
    return { new: "Новое", work: "В работе", done: "Решено", reject: "Отклонено" }[s] || s;
}

function formatDateTime(iso) {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ===== Filters & Tabs =====
function initFilters() {
    document.getElementById("filterCategory").addEventListener("change", renderAppeals);

    document.querySelectorAll(".lenta-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".lenta-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            lentaMode = tab.dataset.lenta;
            renderAppeals();
        });
    });

    document.getElementById("btnTopStars").addEventListener("click", showTop);
}

function showTop() {
    const sorted = [...appeals].sort((a, b) => score(b) - score(a)).slice(0, 10);
    const list = document.getElementById("topList");
    list.innerHTML = sorted.map((a, i) => {
        const rankClass = i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "";
        return `
        <div class="top-item" onclick="closeAllModals();openDetail(${a.id})">
            <div class="top-rank ${rankClass}">${i + 1}</div>
            <div class="top-info">
                <div class="top-title">${a.title}</div>
                <div class="top-score">★ ${a.stars} · <img src="img/comment.png" alt="" class="comment-icon-sm"> ${a.comments.length}</div>
            </div>
        </div>`;
    }).join("");
    openModal("modalTop");
}

// ===== Stars =====
function toggleStar(id, btn) {
    if (!currentUser) { showToast("Войдите, чтобы ставить ★"); return; }
    const a = appeals.find(x => x.id === id);
    if (!a) return;
    const idx = a.starredBy.indexOf(currentUser.phone);
    if (idx >= 0) {
        a.starredBy.splice(idx, 1);
        a.stars = Math.max(0, a.stars - 1);
        btn.classList.remove("starred");
    } else {
        a.starredBy.push(currentUser.phone);
        a.stars++;
        btn.classList.add("starred");
        showToast("Вы поставили ★");
    }
    btn.querySelector("span").textContent = a.stars;
    saveAppeals();
    updateProfileUI();
}

// ===== Detail + Comments =====
function openDetail(id) {
    const a = appeals.find(x => x.id === id);
    if (!a) return;

    document.getElementById("detailTitle").textContent = a.title;
    const myComment = currentUser ? a.comments.find(c => c.authorPhone === currentUser.phone) : null;

    const ownerName = getUserName(a.ownerPhone);
    document.getElementById("detailBody").innerHTML = `
        <div class="detail-meta">
            <span class="appeal-category">${a.category}</span>
            <span class="appeal-status status-${a.status}">${statusText(a.status)}</span>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:6px">
            Автор: <span class="author-link" onclick="openUserProfile('${a.ownerPhone}')">${ownerName}</span>
        </p>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">📍 ${a.address}</p>
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:12px">${formatDateTime(a.date)}</p>
        <p class="detail-desc">${a.description}</p>
        ${a.photo ? `<div class="detail-photo-wrap"><img src="${a.photo}" alt="Фото обращения" class="detail-photo"></div>` : ""}
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
            <button class="star-btn ${a.starredBy.includes(currentUser?.phone) ? "starred" : ""}" id="detailStar">
                <img src="img/star.png" alt="★"><span>${a.stars}</span>
            </button>
        </div>
        <div class="comments-section">
            <h4>Комментарии (${a.comments.length})</h4>
            <div id="commentsList">
                ${a.comments.map(c => {
                    const isOwn = currentUser && c.authorPhone === currentUser.phone;
                    return `
                    <div class="comment" data-cid="${c.id}">
                        <div class="comment-author">
                            <span class="author-link" onclick="openUserProfile('${c.authorPhone}')">${c.authorName}</span>
                            · ${formatDateTime(c.time)}
                        </div>
                        <div class="comment-text" id="ctext-${c.id}">${c.text}</div>
                        ${isOwn ? `
                        <div class="comment-menu">
                            <button class="comment-dots" onclick="toggleCommentMenu(${a.id},${c.id})">⋯</button>
                            <div class="comment-dropdown" id="cdrop-${c.id}">
                                <button onclick="editComment(${a.id},${c.id})">Изменить</button>
                                <button class="danger" onclick="deleteComment(${a.id},${c.id})">Удалить</button>
                            </div>
                        </div>` : ""}
                    </div>`;
                }).join("") || "<p style='color:var(--text-secondary);font-size:14px'>Пока нет комментариев</p>"}
            </div>
            ${!myComment ? `
            <div class="comment-form">
                <input type="text" id="commentInput" placeholder="Написать комментарий...">
                <button id="sendComment">→</button>
            </div>` : `<p style="font-size:13px;color:var(--text-secondary);margin-top:12px">Вы уже оставили комментарий</p>`}
        </div>
    `;

    document.getElementById("detailStar")?.addEventListener("click", () => {
        toggleStar(id, document.getElementById("detailStar"));
        renderAppeals();
    });

    document.getElementById("sendComment")?.addEventListener("click", () => {
        const input = document.getElementById("commentInput");
        const text = input.value.trim();
        if (!text || !currentUser) return;
        if (a.comments.some(c => c.authorPhone === currentUser.phone)) {
            showToast("Можно оставить только один комментарий");
            return;
        }
        a.comments.push({
            id: Date.now(),
            authorPhone: currentUser.phone,
            authorName: currentUser.name,
            text,
            time: new Date().toISOString()
        });
        saveAppeals();
        openDetail(id);
        showToast("Комментарий добавлен");
    });

    openModal("modalDetail");
}

function toggleCommentMenu(aid, cid) {
    document.querySelectorAll(".comment-dropdown").forEach(d => d.classList.remove("open"));
    document.getElementById(`cdrop-${cid}`)?.classList.toggle("open");
}

function editComment(aid, cid) {
    const a = appeals.find(x => x.id === aid);
    const c = a?.comments.find(x => x.id === cid);
    if (!c) return;
    const newText = prompt("Изменить комментарий:", c.text);
    if (newText !== null && newText.trim()) {
        c.text = newText.trim();
        saveAppeals();
        openDetail(aid);
        showToast("Комментарий изменён");
    }
}

function deleteComment(aid, cid) {
    const a = appeals.find(x => x.id === aid);
    if (!a) return;
    a.comments = a.comments.filter(c => c.id !== cid);
    saveAppeals();
    openDetail(aid);
    showToast("Комментарий удалён");
}

function deleteAppeal(id) {
    if (!confirm("Удалить это обращение?")) return;
    appeals = appeals.filter(a => a.id !== id);
    saveAppeals();
    renderMarkers();
    renderAppeals();
    updateProfileUI();
    showToast("Обращение удалено");
}

// ===== New appeal =====
function initForms() {
    document.getElementById("btnNewAppeal").addEventListener("click", () => {
        // Берём текущий центр карты и всегда обновляем адрес
        const coords = getMapCenterCoords();
        const addrInput = document.getElementById("appealAddress");
        const status = document.getElementById("geoStatus");
        if (coords) {
            currentGeo = { lat: coords.lat, lng: coords.lng, address: "Определяем адрес..." };
            if (addrInput) addrInput.value = "Определяем адрес...";
            if (status) status.textContent = "📍 Определяем адрес...";
            reverseGeocode(coords.lat, coords.lng);
        } else if (currentGeo) {
            if (addrInput) addrInput.value = currentGeo.address;
            if (status) status.textContent = "📍 " + currentGeo.address;
        } else {
            if (addrInput) addrInput.value = "";
            if (status) status.textContent = "📍 Местоположение не определено";
        }
        openModal("modalNewAppeal");
    });

    document.getElementById("formNewAppeal").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!currentUser) { showToast("Войдите в аккаунт"); return; }

        // Координаты — всегда с центра карты, если есть
        const coords = getMapCenterCoords();
        if (coords) {
            currentGeo = currentGeo || {};
            currentGeo.lat = coords.lat;
            currentGeo.lng = coords.lng;
        }
        if (!currentGeo || currentGeo.lat == null) {
            showToast("Не удалось определить местоположение");
            return;
        }

        const form = e.target;
        let addressVal = (form.address.value || "").trim();
        if (!addressVal || addressVal.includes("Определяем") || addressVal.includes("не определён")) {
            // Последняя попытка получить адрес
            const addr = await nominatimReverse(currentGeo.lat, currentGeo.lng);
            if (addr) {
                addressVal = addr;
                currentGeo.address = addr;
                form.address.value = addr;
            } else {
                addressVal = currentGeo.address && !currentGeo.address.includes("Определяем")
                    ? currentGeo.address
                    : `Точка ${currentGeo.lat.toFixed(5)}, ${currentGeo.lng.toFixed(5)}`;
                form.address.value = addressVal;
            }
        }
        currentGeo.address = addressVal;

        const photoInput = form.photo;
        let photoData = null;
        if (photoInput && photoInput.files && photoInput.files[0]) {
            try {
                photoData = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(photoInput.files[0]);
                });
            } catch (err) {
                console.warn("Photo read error", err);
            }
        }

        const data = {
            id: Date.now(),
            title: form.description.value.slice(0, 60) + (form.description.value.length > 60 ? "…" : ""),
            category: form.category.value,
            address: addressVal,
            description: form.description.value,
            status: "new",
            stars: 0,
            starredBy: [],
            comments: [],
            lat: currentGeo.lat,
            lng: currentGeo.lng,
            date: new Date().toISOString(),
            ownerPhone: currentUser.phone,
            photo: photoData
        };

        appeals.unshift(data);
        saveAppeals();
        renderMarkers();
        form.reset();
        closeAllModals();
        updateProfileUI();
        showToast("Обращение отправлено и отмечено на карте");
        // Остаёмся на карте
        switchTab("main");
    });

    document.getElementById("avatarInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            currentUser.avatar = reader.result;
            localStorage.setItem("sk_user", JSON.stringify(currentUser));
            const users = JSON.parse(localStorage.getItem("sk_users") || "{}");
            if (users[currentUser.phone]) {
                users[currentUser.phone].avatar = reader.result;
                localStorage.setItem("sk_users", JSON.stringify(users));
            }
            document.getElementById("userAvatar").src = reader.result;
            showToast("Фото обновлено");
        };
        reader.readAsDataURL(file);
    });

    document.getElementById("formSettings").addEventListener("submit", (e) => {
        e.preventDefault();
        const name = e.target.name.value.trim();
        const pass = e.target.password.value;
        currentUser.name = name;
        const users = JSON.parse(localStorage.getItem("sk_users") || "{}");
        if (users[currentUser.phone]) {
            users[currentUser.phone].name = name;
            if (pass) users[currentUser.phone].password = pass;
            localStorage.setItem("sk_users", JSON.stringify(users));
        }
        localStorage.setItem("sk_user", JSON.stringify(currentUser));
        updateProfileUI();
        closeAllModals();
        showToast("Профиль сохранён");
    });

    // Поиск адреса с подсказками
    initAddressSearch();
}

function initAddressSearch() {
    const searchInput = document.getElementById("addressSearch");
    const searchBtn = document.getElementById("btnAddressSearch");
    const suggestBox = document.getElementById("searchSuggest");
    if (!searchInput || !suggestBox) return;

    let suggestTimer = null;
    let pendingRequest = 0;

    const hideSuggest = () => {
        suggestBox.hidden = true;
        suggestBox.innerHTML = "";
    };

    const goToCoords = (lat, lng, address) => {
        hideSuggest();
        if (map) map.setCenter([lat, lng], 16, { duration: 350 });
        currentGeo = { lat, lng, address };
        updateAddressFields();
        searchInput.value = address;
        showToast("📍 " + address);
    };

    const goToAddress = async (query) => {
        const q = (query || "").trim();
        if (!q) return;
        hideSuggest();
        // OpenStreetMap
        const items = await nominatimSearch(q);
        if (items.length) {
            goToCoords(items[0].lat, items[0].lng, items[0].text);
            return;
        }
        // Яндекс fallback
        if (typeof ymaps !== "undefined" && ymaps.geocode) {
            try {
                const res = await ymaps.geocode(q, { results: 1 });
                const first = res.geoObjects.get(0);
                if (first) {
                    const coords = first.geometry.getCoordinates();
                    goToCoords(coords[0], coords[1], first.getAddressLine() || q);
                    return;
                }
            } catch (e) {}
        }
        showToast("Адрес не найден");
    };

    const showSuggestions = (items) => {
        if (!items.length) {
            suggestBox.innerHTML = `<div class="search-suggest-empty">Ничего не найдено</div>`;
            suggestBox.hidden = false;
            return;
        }
        suggestBox.innerHTML = items.map((item) => {
            const display = item.text || "";
            const parts = display.split(", ");
            const main = parts[0] || display;
            const sub = parts.slice(1).join(", ");
            const safe = display.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
            return `<div class="search-suggest-item" data-lat="${item.lat}" data-lng="${item.lng}" data-value="${safe}">
                <div class="suggest-main">${main}</div>
                ${sub ? `<div class="suggest-sub">${sub}</div>` : ""}
            </div>`;
        }).join("");
        suggestBox.hidden = false;
        suggestBox.querySelectorAll(".search-suggest-item").forEach(el => {
            el.addEventListener("mousedown", (e) => {
                e.preventDefault();
                const lat = parseFloat(el.getAttribute("data-lat"));
                const lng = parseFloat(el.getAttribute("data-lng"));
                const val = el.getAttribute("data-value");
                goToCoords(lat, lng, val);
            });
        });
    };

    const fetchSuggest = async (q) => {
        const reqId = ++pendingRequest;
        suggestBox.innerHTML = `<div class="search-suggest-empty">Ищем…</div>`;
        suggestBox.hidden = false;

        let items = await nominatimSearch(q);
        if (reqId !== pendingRequest) return;

        // Дополняем Яндексом, если пусто
        if (!items.length && typeof ymaps !== "undefined" && ymaps.geocode) {
            try {
                const res = await ymaps.geocode(q, { results: 6 });
                res.geoObjects.each((obj) => {
                    const coords = obj.geometry.getCoordinates();
                    items.push({ text: obj.getAddressLine(), lat: coords[0], lng: coords[1] });
                });
            } catch (e) {}
        }
        if (reqId !== pendingRequest) return;
        if (searchInput.value.trim() !== q) return;
        showSuggestions(items);
    };

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim();
        clearTimeout(suggestTimer);
        if (q.length < 2) {
            hideSuggest();
            return;
        }
        suggestTimer = setTimeout(() => fetchSuggest(q), 300);
    });

    searchInput.addEventListener("focus", () => {
        const q = searchInput.value.trim();
        if (q.length >= 2) {
            if (suggestBox.innerHTML) suggestBox.hidden = false;
            else fetchSuggest(q);
        }
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const first = suggestBox.querySelector(".search-suggest-item");
            if (first && !suggestBox.hidden) {
                goToCoords(
                    parseFloat(first.getAttribute("data-lat")),
                    parseFloat(first.getAttribute("data-lng")),
                    first.getAttribute("data-value")
                );
            } else {
                goToAddress(searchInput.value);
            }
        } else if (e.key === "Escape") {
            hideSuggest();
        }
    });

    searchBtn?.addEventListener("click", () => goToAddress(searchInput.value));

    document.addEventListener("click", (e) => {
        if (!e.target.closest("#headerSearchWrap") && !e.target.closest("#searchSuggest")) {
            hideSuggest();
        }
    });
}

// ===== Profile =====
function updateProfileUI() {
    if (!currentUser) return;
    document.getElementById("userName").textContent = currentUser.name;
    if (currentUser.avatar) {
        document.getElementById("userAvatar").src = currentUser.avatar;
    }
    const myAppeals = appeals.filter(a => a.ownerPhone === currentUser.phone);
    document.getElementById("myAppealsCount").textContent = myAppeals.length;
    const starsReceived = myAppeals.reduce((s, a) => s + a.stars, 0);
    document.getElementById("myStarsCount").textContent = starsReceived;
}

function getUserName(phone) {
    if (!phone) return "Пользователь";
    if (phone === "admin") return "Администрация";
    if (currentUser && currentUser.phone === phone) return currentUser.name;
    const users = JSON.parse(localStorage.getItem("sk_users") || "{}");
    if (users[phone] && users[phone].name) return users[phone].name;
    // fallback: search in comments / appeals for a known name
    for (const a of appeals) {
        if (a.ownerPhone === phone) {
            // try comments by this user
        }
        for (const c of a.comments || []) {
            if (c.authorPhone === phone && c.authorName) return c.authorName;
        }
    }
    // last resort: mask phone
    if (phone.length >= 4) return "Пользователь ···" + phone.slice(-4);
    return "Пользователь";
}

function getUserAvatar(phone) {
    if (currentUser && currentUser.phone === phone && currentUser.avatar) return currentUser.avatar;
    const users = JSON.parse(localStorage.getItem("sk_users") || "{}");
    if (users[phone] && users[phone].avatar) return users[phone].avatar;
    return "img/logo.jpg";
}

function openUserProfile(phone) {
    if (!phone) return;
    // if it's me — just switch to profile tab
    if (currentUser && currentUser.phone === phone) {
        closeAllModals();
        switchTab("profile");
        return;
    }
    const name = getUserName(phone);
    const avatar = getUserAvatar(phone);
    const userAppeals = appeals.filter(a => a.ownerPhone === phone);
    const stars = userAppeals.reduce((s, a) => s + a.stars, 0);
    const commentsCount = appeals.reduce((s, a) => s + (a.comments || []).filter(c => c.authorPhone === phone).length, 0);

    document.getElementById("userProfileBody").innerHTML = `
        <img src="${avatar}" alt="" class="user-profile-avatar">
        <div class="user-profile-name">${name}</div>
        <div class="user-profile-stats">
            <div class="p-stat">
                <span class="p-num">${userAppeals.length}</span>
                <span class="p-label">Обращений</span>
            </div>
            <div class="p-stat">
                <span class="p-num">${stars}</span>
                <span class="p-label">★ получено</span>
            </div>
            <div class="p-stat">
                <span class="p-num">${commentsCount}</span>
                <span class="p-label">Комментариев</span>
            </div>
        </div>
        <div class="user-profile-appeals">
            <h4>Обращения пользователя</h4>
            ${userAppeals.length ? userAppeals.slice(0, 10).map(a => `
                <div class="user-appeal-item" onclick="closeAllModals();openDetail(${a.id})">
                    <div class="ua-title">${a.title}</div>
                    <div class="ua-meta">${a.category} · ★ ${a.stars} · ${statusText(a.status)}</div>
                </div>
            `).join("") : "<p style='color:var(--text-secondary);font-size:14px'>Нет обращений</p>"}
        </div>
    `;
    openModal("modalUserProfile");
}

function initModals() {
    document.querySelectorAll("[data-close]").forEach(btn => {
        btn.addEventListener("click", closeAllModals);
    });
    document.querySelectorAll(".modal").forEach(m => {
        m.addEventListener("click", (e) => { if (e.target === m) closeAllModals(); });
    });

    document.querySelectorAll(".menu-item").forEach(item => {
        item.addEventListener("click", () => {
            if (item.dataset.action === "settings") {
                document.getElementById("settingsName").value = currentUser.name;
                document.getElementById("settingsPhone").value = currentUser.phone;
                openModal("modalSettings");
            }
        });
    });

    document.getElementById("btnLogout").addEventListener("click", logout);

    document.getElementById("btnMyAppealsStat").addEventListener("click", () => {
        switchTab("lenta");
        lentaMode = "my";
        document.querySelectorAll(".lenta-tab").forEach(t => t.classList.toggle("active", t.dataset.lenta === "my"));
        renderAppeals();
    });
}

function openModal(id) {
    document.getElementById(id).classList.add("open");
}
function closeAllModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("open"));
    document.querySelectorAll(".comment-dropdown").forEach(d => d.classList.remove("open"));
}

function saveAppeals() {
    localStorage.setItem("sk_appeals", JSON.stringify(appeals));
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2500);
}

window.openDetail = openDetail;
window.deleteAppeal = deleteAppeal;
window.toggleCommentMenu = toggleCommentMenu;
window.editComment = editComment;
window.deleteComment = deleteComment;
window.closeAllModals = closeAllModals;
window.openUserProfile = openUserProfile;

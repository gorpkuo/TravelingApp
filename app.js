const state = {
  trips: [],
  currentTripId: null,
  currentDayId: null
};

const views = [...document.querySelectorAll('.view')];
const tripListEl = document.getElementById('tripList');
const dayListEl = document.getElementById('dayList');
const exportJsonBtn = document.getElementById('exportJson');
const importJsonBtn = document.getElementById('importJsonBtn');
const importJsonFile = document.getElementById('importJsonFile');
const todoListEl = document.getElementById('todoList');
const todoInputEl = document.getElementById('todoInput');
const foodListEl = document.getElementById('foodList');
const foodRegionFilterEl = document.getElementById('foodRegionFilter');
const foodRegionInputEl = document.getElementById('foodRegionInput');
const foodNameInputEl = document.getElementById('foodNameInput');
const foodAddressInputEl = document.getElementById('foodAddressInput');
const foodBookingTimeInputEl = document.getElementById('foodBookingTimeInput');
const foodBookedInputEl = document.getElementById('foodBookedInput');
const foodNoteInputEl = document.getElementById('foodNoteInput');
const trafficListEl = document.getElementById('trafficList');
const trafficTypeInputEl = document.getElementById('trafficTypeInput');
const trafficCustomTypeInputEl = document.getElementById('trafficCustomTypeInput');
const addTrafficTypeBtnEl = document.getElementById('addTrafficTypeBtn');
const trafficTypeManageListEl = document.getElementById('trafficTypeManageList');
const trafficNoteInputEl = document.getElementById('trafficNoteInput');
const trafficBookingInputEl = document.getElementById('trafficBookingInput');
const trafficRideTimeInputEl = document.getElementById('trafficRideTimeInput');
const trafficPaymentInputEl = document.getElementById('trafficPaymentInput');
const DEFAULT_TRAFFIC_TYPES = ['開車', '地鐵', '火車', '巴士', '走路', '飛機'];
const spotEditModalEl = document.getElementById('spotEditModal');
const spotEditNameEl = document.getElementById('spotEditName');
const spotEditTimeEl = document.getElementById('spotEditTime');
const spotEditAddressEl = document.getElementById('spotEditAddress');
const spotEditTransportTypeEl = document.getElementById('spotEditTransportType');
const spotEditTransportAddressEl = document.getElementById('spotEditTransportAddress');
const spotEditTransportMapBtnEl = document.getElementById('spotEditTransportMapBtn');
const spotEditTransportNoteEl = document.getElementById('spotEditTransportNote');
const spotEditNoteEl = document.getElementById('spotEditNote');
const spotEditSaveBtnEl = document.getElementById('spotEditSaveBtn');
const spotEditCancelBtnEl = document.getElementById('spotEditCancelBtn');
let editingSpotId = null;
const foodEditModalEl = document.getElementById('foodEditModal');
const foodEditRegionEl = document.getElementById('foodEditRegion');
const foodEditNameEl = document.getElementById('foodEditName');
const foodEditAddressEl = document.getElementById('foodEditAddress');
const foodEditBookingTimeEl = document.getElementById('foodEditBookingTime');
const foodEditBookedEl = document.getElementById('foodEditBooked');
const foodEditNoteEl = document.getElementById('foodEditNote');
const foodEditSaveBtnEl = document.getElementById('foodEditSaveBtn');
const foodEditCancelBtnEl = document.getElementById('foodEditCancelBtn');
let editingFoodId = null;

function normalizeTheme(theme) {
  return ['mediterranean', 'sunset', 'neon'].includes(theme) ? theme : 'mediterranean';
}

function setActiveTheme(theme) {
  document.body.setAttribute('data-theme', normalizeTheme(theme));
}

function themeLabel(theme) {
  const t = normalizeTheme(theme);
  if (t === 'sunset') return '日落撞色';
  if (t === 'neon') return '都會霓虹';
  return '地中海亮色';
}

async function persistTrips() {
  try {
    await saveTripsToDb(state.trips);
  } catch {
    alert('儲存失敗，請稍後重試');
  }
}

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
}

function show(viewId) {
  views.forEach(v => v.classList.toggle('active', v.id === viewId));
}

function formatDate(dateStr) {
  return dateStr.replaceAll('-', '/');
}

function backupDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function buildDays(startDate, endDate) {
  const [startY, startM, startD] = startDate.split('-').map(Number);
  const [endY, endM, endD] = endDate.split('-').map(Number);
  const start = new Date(startY, startM - 1, startD);
  const end = new Date(endY, endM - 1, endD);
  const days = [];
  let i = 1;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${dayNum}`;
    days.push({
      id: uid('day'),
      date: iso,
      title: `Day ${i}`,
      meals: { breakfast: '猶豫中', lunch: '猶豫中', dinner: '猶豫中', snacks: [] },
      spots: [],
      transport: { type: '開車', note: '' },
      dailyNote: ''
    });
    i += 1;
  }
  return days;
}

function currentTrip() {
  return state.trips.find(t => t.id === state.currentTripId);
}

function nowLabel() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function currentDay() {
  const trip = currentTrip();
  if (!trip) return null;
  return trip.days.find(d => d.id === state.currentDayId);
}

function renderSnapshotList() {
  const listEl = document.getElementById('snapshotList');
  if (!listEl) return;
  const trip = currentTrip();
  listEl.innerHTML = '';
  if (!trip) return;

  const items = state.snapshots
    .filter((s) => s.tripId === trip.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (!items.length) {
    listEl.innerHTML = '<div class="panel">目前沒有快照</div>';
    return;
  }

  items.forEach((s) => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${s.tripName}</strong><br>${s.label}`;

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'btn btn-light';
    restoreBtn.textContent = '還原';
    restoreBtn.addEventListener('click', async () => {
      const ok = confirm(`確定還原快照：${s.label}？`);
      if (!ok) return;
      const idx = state.trips.findIndex((t) => t.id === s.tripId);
      if (idx < 0) return;
      state.trips[idx] = deepClone(s.tripData);
      await persistTrips();
      if (state.currentTripId === s.tripId) {
        setActiveTheme(state.trips[idx].theme);
        document.getElementById('tripMainTitle').textContent = state.trips[idx].name;
      }
      renderSnapshotList();
      alert('已還原快照');
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', async () => {
      state.snapshots = state.snapshots.filter((x) => x.id !== s.id);
      await deleteSnapshotFromDb(s.id);
      renderSnapshotList();
    });

    row.appendChild(info);
    row.appendChild(restoreBtn);
    row.appendChild(deleteBtn);
    listEl.appendChild(row);
  });
}

function ensureTodo(trip) {
  if (!Array.isArray(trip.todo)) {
    trip.todo = [];
  }
}

function ensureFood(trip) {
  if (!Array.isArray(trip.food)) {
    trip.food = [];
  }
}

function formatDateTimeLocal(raw) {
  if (!raw) return '未設定';
  if (raw.includes('T')) {
    const [d, t] = raw.split('T');
    if (d && t) return `${d.replaceAll('-', '/')} ${t}`;
  }
  return raw;
}

function isNonEmptyText(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function hasMealsData(day) {
  const base = ['breakfast', 'lunch', 'dinner'].some((k) => isNonEmptyText(day.meals?.[k]) && day.meals[k] !== '猶豫中');
  const snacks = Array.isArray(day.meals?.snacks) && day.meals.snacks.length > 0;
  return base || snacks;
}

function hasDayData(day) {
  const hasSpots = Array.isArray(day.spots) && day.spots.length > 0;
  const hasNote = isNonEmptyText(day.dailyNote);
  const hasMeals = hasMealsData(day);
  return hasSpots || hasNote || hasMeals;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('\"', '&quot;')
    .replaceAll("'", '&#39;');
}

function extractMapQueryFromMealText(text) {
  const raw = (text || '').trim();
  if (!raw || raw === '猶豫中' || raw === '（無）') return '';
  // remove bracket tags like [未訂位]
  return raw.replace(/\[[^\]]*\]/g, '').trim();
}

function mealLineHtml(label, value) {
  const query = extractMapQueryFromMealText(value);
  const safeValue = escapeHtml(value || '猶豫中');
  if (!query) {
    return `<div><strong>${label}：</strong>${safeValue}</div>`;
  }
  const q = encodeURIComponent(query);
  return `<div><strong>${label}：</strong>${safeValue} <button class="btn btn-light meal-map-btn" data-map-query="${q}" type="button">地圖</button></div>`;
}

function buildTripPrintHtml(trip) {
  const days = (trip.days || []).filter(hasDayData);
  const dayBlocks = days.map((day) => {
    const meals = day.meals || {};
    const mealRows = [
      ['早餐', meals.breakfast],
      ['午餐', meals.lunch],
      ['晚餐', meals.dinner]
    ].filter(([, v]) => isNonEmptyText(v) && v !== '猶豫中')
      .map(([k, v]) => `<li><strong>${k}：</strong>${escapeHtml(v)}</li>`)
      .join('');
    const snacksRow = Array.isArray(meals.snacks) && meals.snacks.length
      ? `<li><strong>小吃：</strong>${meals.snacks.map((s) => escapeHtml(s)).join('、')}</li>`
      : '';

    const spotRows = (day.spots || []).map((s, i) => {
      const transportType = s.transport?.type || '未設定';
      const transportAddress = s.transport?.address || '（無交通地址）';
      const transportNote = s.transport?.note || '（無備註）';
      return `<li>
        <strong>${i + 1}. ${escapeHtml(s.name || '未命名景點')}</strong>
        <div>時間：${escapeHtml(s.time || '未設定')}</div>
        <div>地址：${escapeHtml(s.address || '（無地址）')}</div>
        <div>交通地址：${escapeHtml(transportAddress)}</div>
        <div>交通：${escapeHtml(transportType)}｜備註：${escapeHtml(transportNote)}</div>
        <div>景點備註：${escapeHtml(s.note || '（無備註）')}</div>
      </li>`;
    }).join('');

    const noteHtml = isNonEmptyText(day.dailyNote) ? `<div><strong>備註：</strong>${escapeHtml(day.dailyNote)}</div>` : '';
    const mealsHtml = (mealRows || snacksRow) ? `<ul>${mealRows}${snacksRow}</ul>` : '<div>（無餐食資料）</div>';
    const spotsHtml = spotRows ? `<ol>${spotRows}</ol>` : '<div>（無景點資料）</div>';

    return `<section class="print-day">
      <h3>${escapeHtml(day.title)}｜${escapeHtml(formatDate(day.date))}</h3>
      <h4>食</h4>
      ${mealsHtml}
      <h4>景 / 行</h4>
      ${spotsHtml}
      ${noteHtml}
    </section>`;
  }).join('');

  return `<article class="print-sheet">
    <header>
      <h1>${escapeHtml(trip.name)}</h1>
      <div>${escapeHtml(trip.country)}｜${escapeHtml(trip.region)}</div>
      <div>${escapeHtml(trip.startDate)} - ${escapeHtml(trip.endDate)}</div>
    </header>
    ${dayBlocks || '<div>目前沒有可輸出的已儲存行程內容。</div>'}
  </article>`;
}

function renderFood() {
  const trip = currentTrip();
  foodListEl.innerHTML = '';
  if (!trip) return;
  ensureFood(trip);
  renderFoodRegionFilter(trip);

  if (!trip.food.length) {
    foodListEl.innerHTML = '<div class="panel">目前沒有美食項目</div>';
    return;
  }

  const selectedRegion = foodRegionFilterEl.value;
  const visibleFood = selectedRegion
    ? trip.food.filter((item) => (item.region || '未分類') === selectedRegion)
    : trip.food;

  if (!visibleFood.length) {
    foodListEl.innerHTML = '<div class="panel">這個地區目前沒有美食項目</div>';
    return;
  }

  visibleFood.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `panel google-list-card ${googleCardClass(index)}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    const region = item.region || '未分類';
    const name = item.name || '未命名餐廳';
    const address = item.address || '（無地址）';
    const booked = item.booked || '未訂位';
    const bookedClass = booked === '已訂位' ? 'badge-food-booked' : 'badge-food-unbooked';
    const bookingTime = formatDateTimeLocal(item.bookingTime);
    const note = item.note || '（無備註）';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${region}｜${name}</strong><br>地址：${address}<br>訂位：<span class="status-badge ${bookedClass}">${booked}</span>｜時間：${bookingTime}<br>${note}`;

    const actionWrap = document.createElement('div');
    actionWrap.style.display = 'grid';
    actionWrap.style.gap = '8px';

    const mapBtn = document.createElement('button');
    mapBtn.className = 'btn btn-light';
    mapBtn.textContent = '地圖';
    mapBtn.addEventListener('click', () => {
      const region = (item.region || '').trim();
      const name = (item.name || '').trim();
      if (!name) {
        alert('此筆餐廳名稱為空，無法搜尋地圖');
        return;
      }
      const query = [region, name].filter(Boolean).join(' ');
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, '_blank', 'noopener');
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-light';
    editBtn.textContent = '編輯';
    editBtn.addEventListener('click', () => openFoodEditModal(item));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', async () => {
      trip.food = trip.food.filter((f) => f.id !== item.id);
      await persistTrips();
      renderFood();
    });

    row.appendChild(info);
    actionWrap.appendChild(mapBtn);
    actionWrap.appendChild(editBtn);
    actionWrap.appendChild(deleteBtn);
    row.appendChild(actionWrap);
    foodListEl.appendChild(row);
  });
}

function foodRegions(trip) {
  return [...new Set(trip.food.map((item) => item.region || '未分類'))].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
}

function renderFoodRegionFilter(trip) {
  const previous = foodRegionFilterEl.value;
  const regions = foodRegions(trip);
  foodRegionFilterEl.innerHTML = '';

  const allOption = document.createElement('option');
  allOption.value = '';
  allOption.textContent = '全部地區';
  foodRegionFilterEl.appendChild(allOption);

  regions.forEach((region) => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    foodRegionFilterEl.appendChild(option);
  });

  foodRegionFilterEl.value = regions.includes(previous) ? previous : '';
}

function openFoodEditModal(item) {
  editingFoodId = item.id;
  foodEditRegionEl.value = item.region || '';
  foodEditNameEl.value = item.name || '';
  foodEditAddressEl.value = item.address || '';
  foodEditBookingTimeEl.value = item.bookingTime || '';
  foodEditBookedEl.value = item.booked || '未訂位';
  foodEditNoteEl.value = item.note || '';
  foodEditModalEl.classList.add('show');
  foodEditModalEl.setAttribute('aria-hidden', 'false');
}

function closeFoodEditModal() {
  editingFoodId = null;
  foodEditModalEl.classList.remove('show');
  foodEditModalEl.setAttribute('aria-hidden', 'true');
}

function renderMealPresets() {
  const trip = currentTrip();
  const selectEl = document.getElementById('mealPresetSelect');
  if (!selectEl) return;
  selectEl.innerHTML = '';
  if (!trip) return;
  ensureFood(trip);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = trip.food.length ? '請選擇美食規劃項目' : '目前沒有美食規劃項目';
  selectEl.appendChild(placeholder);

  trip.food.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    const region = item.region || '未分類';
    const name = item.name || '未命名餐廳';
    const booked = item.booked || '未訂位';
    opt.textContent = `${region}｜${name} [${booked}]`;
    selectEl.appendChild(opt);
  });
}

function ensureDaySnacks(day) {
  if (!day.meals) day.meals = {};
  if (!Array.isArray(day.meals.snacks)) {
    day.meals.snacks = [];
  }
}

function renderSnackList(day) {
  ensureDaySnacks(day);
  const listEl = document.getElementById('mealSnackList');
  if (!listEl) return;
  listEl.innerHTML = '';

  if (!day.meals.snacks.length) {
    listEl.innerHTML = '<div class="panel">目前沒有小吃項目</div>';
    return;
  }

  day.meals.snacks.forEach((snack, idx) => {
    const row = document.createElement('div');
    row.className = 'panel';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    const text = document.createElement('span');
    text.textContent = snack;
    const del = document.createElement('button');
    del.className = 'btn btn-light';
    del.textContent = '刪除';
    del.addEventListener('click', () => {
      day.meals.snacks.splice(idx, 1);
      renderSnackList(day);
    });

    row.appendChild(text);
    row.appendChild(del);
    listEl.appendChild(row);
  });
}

function renderTodo() {
  const trip = currentTrip();
  todoListEl.innerHTML = '';
  if (!trip) return;
  ensureTodo(trip);

  if (!trip.todo.length) {
    todoListEl.innerHTML = '<div class="panel">目前沒有待辦項目</div>';
    return;
  }

  trip.todo.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `panel google-list-card ${googleCardClass(index)}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto auto';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    const text = document.createElement('span');
    text.textContent = item.text;
    text.style.textDecoration = item.done ? 'line-through' : 'none';
    text.style.opacity = item.done ? '0.55' : '1';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-light';
    toggleBtn.textContent = item.done ? '取消完成' : '完成';
    toggleBtn.addEventListener('click', async () => {
      item.done = !item.done;
      await persistTrips();
      renderTodo();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', async () => {
      trip.todo = trip.todo.filter(t => t.id !== item.id);
      await persistTrips();
      renderTodo();
    });

    row.appendChild(text);
    row.appendChild(toggleBtn);
    row.appendChild(deleteBtn);
    todoListEl.appendChild(row);
  });
}

function ensureTraffic(trip) {
  if (!Array.isArray(trip.traffic)) {
    trip.traffic = [];
  }
}

function ensureTrafficTypeOptions(trip) {
  if (!Array.isArray(trip.trafficTypeOptions)) {
    trip.trafficTypeOptions = [...DEFAULT_TRAFFIC_TYPES];
  }
}

function normalizeTrafficTypeOptions(trip) {
  ensureTrafficTypeOptions(trip);
  const unique = [];
  [...DEFAULT_TRAFFIC_TYPES, ...trip.trafficTypeOptions].forEach((name) => {
    const n = String(name || '').trim();
    if (!n) return;
    if (!unique.includes(n)) unique.push(n);
  });
  trip.trafficTypeOptions = unique;
}

async function addCustomTrafficType() {
  const trip = currentTrip();
  if (!trip) return;
  normalizeTrafficTypeOptions(trip);

  const custom = trafficCustomTypeInputEl.value.trim();
  if (!custom) {
    alert('請輸入自訂交通工具');
    return;
  }
  if (trip.trafficTypeOptions.includes(custom)) {
    alert('此交通工具已存在');
    trafficTypeInputEl.value = custom;
    return;
  }

  trip.trafficTypeOptions.push(custom);
  renderTrafficTypeOptions();
  renderTrafficTypeManageList();
  trafficTypeInputEl.value = custom;
  trafficCustomTypeInputEl.value = '';
  await persistTrips();
  alert(`已加入交通工具：${custom}`);
}

function renderTrafficTypeOptions() {
  const trip = currentTrip();
  if (!trip) return;
  normalizeTrafficTypeOptions(trip);

  const syncSelect = (selectEl) => {
    const selected = selectEl.value;
    selectEl.innerHTML = '';
    trip.trafficTypeOptions.forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      selectEl.appendChild(opt);
    });
    if (trip.trafficTypeOptions.includes(selected)) {
      selectEl.value = selected;
    } else if (trip.trafficTypeOptions.length > 0) {
      selectEl.value = trip.trafficTypeOptions[0];
    }
  };

  syncSelect(trafficTypeInputEl);
  const dayTransportSelect = document.getElementById('transportType');
  if (dayTransportSelect) {
    syncSelect(dayTransportSelect);
  }
  if (spotEditTransportTypeEl) {
    syncSelect(spotEditTransportTypeEl);
  }
}

function isDefaultTrafficType(name) {
  return DEFAULT_TRAFFIC_TYPES.includes(name);
}

function isTrafficTypeUsed(trip, typeName) {
  return (trip.traffic || []).some((item) => item.type === typeName);
}

function renderTrafficTypeManageList() {
  const trip = currentTrip();
  trafficTypeManageListEl.innerHTML = '';
  if (!trip) return;
  normalizeTrafficTypeOptions(trip);
  const customOptions = trip.trafficTypeOptions.filter((name) => !isDefaultTrafficType(name));

  if (!customOptions.length) {
    return;
  }

  customOptions.forEach((name, index) => {
    const row = document.createElement('div');
    row.className = `panel google-list-card ${googleCardClass(index)}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    const label = document.createElement('span');
    label.textContent = name;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除';

    if (isTrafficTypeUsed(trip, name)) {
      deleteBtn.disabled = true;
      deleteBtn.textContent = '使用中';
    } else {
      deleteBtn.addEventListener('click', async () => {
        trip.trafficTypeOptions = trip.trafficTypeOptions.filter((t) => t !== name);
        renderTrafficTypeOptions();
        renderTrafficTypeManageList();
        await persistTrips();
      });
    }

    row.appendChild(label);
    row.appendChild(deleteBtn);
    trafficTypeManageListEl.appendChild(row);
  });
}

function renderTraffic() {
  const trip = currentTrip();
  trafficListEl.innerHTML = '';
  if (!trip) return;
  ensureTraffic(trip);
  renderTrafficTypeOptions();
  renderTrafficTypeManageList();

  if (!trip.traffic.length) {
    trafficListEl.innerHTML = '<div class="panel">目前沒有交通項目</div>';
    return;
  }

  trip.traffic.forEach((item, index) => {
    const booking = item.booking || '未訂購';
    const rideTime = formatRideTime(item.rideTime);
    const payment = item.payment || '未付款';
    const bookingClass = booking === '已訂購' ? 'badge-booked' : 'badge-unbooked';

    const row = document.createElement('div');
    row.className = `panel google-list-card ${googleCardClass(index)}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    const info = document.createElement('div');
    info.innerHTML = `<strong>${item.type}</strong><br>訂購：<span class="status-badge ${bookingClass}">${booking}</span>｜搭乘時間：${rideTime}｜付款：${payment}<br>${item.note || '（無備註）'}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', async () => {
      trip.traffic = trip.traffic.filter(t => t.id !== item.id);
      await persistTrips();
      renderTraffic();
      renderTrafficTypeManageList();
    });

    row.appendChild(info);
    row.appendChild(deleteBtn);
    trafficListEl.appendChild(row);
  });
}

function renderSpotTrafficPresets() {
  const trip = currentTrip();
  const selectEl = document.getElementById('spotTrafficPresetSelect');
  if (!selectEl) return;
  selectEl.innerHTML = '';
  if (!trip) return;
  ensureTraffic(trip);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = trip.traffic.length ? '請選擇交通規劃項目' : '目前沒有交通規劃項目';
  selectEl.appendChild(placeholder);

  trip.traffic.forEach((item, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    const time = item.rideTime ? formatRideTime(item.rideTime) : '未設定時間';
    opt.textContent = `${item.type}｜${time}｜${item.note || '（無備註）'}`;
    selectEl.appendChild(opt);
  });
}

function formatRideTime(raw) {
  if (!raw) return '未設定';
  // New format from datetime-local: 2026-06-24T09:15
  if (raw.includes('T')) {
    const [d, t] = raw.split('T');
    if (d && t) {
      return `${d.replaceAll('-', '/')} ${t}`;
    }
  }
  // Backward compatible for legacy value (time-only or unknown format)
  return raw;
}

function openGoogleMapByQuery(query, emptyMessage) {
  const q = (query || '').trim();
  if (!q) {
    alert(emptyMessage);
    return;
  }
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  window.open(url, '_blank', 'noopener');
}

const GOOGLE_CARD_CLASSES = ['google-card-blue', 'google-card-red', 'google-card-yellow', 'google-card-green'];

function googleCardClass(index) {
  return GOOGLE_CARD_CLASSES[index % GOOGLE_CARD_CLASSES.length];
}

function renderTrips() {
  tripListEl.innerHTML = '';
  if (!state.trips.length) {
    tripListEl.innerHTML = '<div class="panel">目前沒有旅程</div>';
    return;
  }

  state.trips.forEach((trip, index) => {
    const card = document.createElement('div');
    card.className = `panel trip-card trip-theme-${normalizeTheme(trip.theme)} ${googleCardClass(index)}`;

    const openBtn = document.createElement('button');
    openBtn.className = 'btn trip-open-btn';
    openBtn.style.width = '100%';
    openBtn.style.marginBottom = '8px';
    openBtn.innerHTML = `<strong>${trip.name}</strong><br>${trip.country}｜${trip.region}<br>${trip.startDate} - ${trip.endDate}`;
    openBtn.addEventListener('click', () => {
      state.currentTripId = trip.id;
      setActiveTheme(trip.theme);
      document.getElementById('tripMainTitle').textContent = trip.name;
      renderSnapshotList();
      show('trip-main');
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除旅程';
    deleteBtn.addEventListener('click', async () => {
      const ok = confirm(`確定刪除「${trip.name}」？此動作無法復原。`);
      if (!ok) return;

      state.trips = state.trips.filter(t => t.id !== trip.id);
      if (state.currentTripId === trip.id) {
        state.currentTripId = null;
        state.currentDayId = null;
      }
      await persistTrips();
      renderTrips();
    });

    const themeWrap = document.createElement('div');
    themeWrap.style.display = 'grid';
    themeWrap.style.gridTemplateColumns = '86px 1fr';
    themeWrap.style.alignItems = 'center';
    themeWrap.style.gap = '8px';
    themeWrap.style.marginBottom = '8px';

    const themeText = document.createElement('span');
    themeText.textContent = '風格';

    const themeSelect = document.createElement('select');
    themeSelect.className = 'theme-select';
    [
      { value: 'mediterranean', label: '地中海亮色' },
      { value: 'sunset', label: '日落撞色' },
      { value: 'neon', label: '都會霓虹' }
    ].forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.label;
      themeSelect.appendChild(o);
    });
    themeSelect.value = normalizeTheme(trip.theme);
    themeSelect.addEventListener('change', async () => {
      trip.theme = normalizeTheme(themeSelect.value);
      // Immediate preview: switching theme in trip list updates current UI instantly.
      setActiveTheme(trip.theme);
      state.currentTripId = trip.id;
      await persistTrips();
    });
    themeText.title = `目前：${themeLabel(themeSelect.value)}`;
    themeSelect.addEventListener('change', () => {
      themeText.title = `目前：${themeLabel(themeSelect.value)}`;
    });

    themeWrap.appendChild(themeText);
    themeWrap.appendChild(themeSelect);

    card.appendChild(openBtn);
    card.appendChild(themeWrap);
    card.appendChild(deleteBtn);
    tripListEl.appendChild(card);
  });
}

function renderDays() {
  const trip = currentTrip();
  dayListEl.innerHTML = '';
  if (!trip) return;
  const rsStart = document.getElementById('rescheduleStartDate');
  const rsEnd = document.getElementById('rescheduleEndDate');
  if (rsStart) rsStart.value = trip.startDate || '';
  if (rsEnd) rsEnd.value = trip.endDate || '';
  renderSwapDayOptions(trip);

  trip.days.forEach((day, index) => {
    const row = document.createElement('div');
    row.className = `panel day-row google-list-card ${googleCardClass(index)}`;
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto auto';
    row.style.gap = '8px';
    row.style.alignItems = 'center';

    const labelWrap = document.createElement('div');
    labelWrap.className = 'day-row-text';

    const label = document.createElement('div');
    label.className = 'day-row-title';
    label.textContent = `${day.title}：${formatDate(day.date)}`;

    const spotHint = document.createElement('div');
    spotHint.className = 'day-row-hint';
    if (Array.isArray(day.spots) && day.spots.length > 0) {
      const first = day.spots[0]?.name || '未命名景點';
      spotHint.textContent = first;
    } else {
      spotHint.textContent = '';
    }

    labelWrap.appendChild(label);
    labelWrap.appendChild(spotHint);

    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-light';
    viewBtn.textContent = '查看';
    viewBtn.addEventListener('click', () => {
      state.currentDayId = day.id;
      renderDayView();
      show('day-view');
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn';
    editBtn.textContent = '編輯';
    editBtn.addEventListener('click', () => {
      state.currentDayId = day.id;
      loadDayEditor();
      show('day-editor');
    });

    row.appendChild(labelWrap);
    row.appendChild(viewBtn);
    row.appendChild(editBtn);
    dayListEl.appendChild(row);
  });
}

function renderSwapDayOptions(trip) {
  const fromEl = document.getElementById('swapDayFrom');
  const toEl = document.getElementById('swapDayTo');
  if (!fromEl || !toEl) return;

  const fill = (el, selected) => {
    el.innerHTML = '';
    trip.days.forEach((day, idx) => {
      const opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = `${day.title}｜${formatDate(day.date)}`;
      el.appendChild(opt);
    });
    if (selected != null && selected < trip.days.length) {
      el.value = String(selected);
    }
  };

  const prevFrom = Number(fromEl.value);
  const prevTo = Number(toEl.value);
  fill(fromEl, Number.isFinite(prevFrom) ? prevFrom : 0);
  fill(toEl, Number.isFinite(prevTo) ? prevTo : Math.min(1, trip.days.length - 1));
}

function renderDayView() {
  const day = currentDay();
  if (!day) return;
  document.getElementById('dayViewTitle').textContent = `${day.title} ${formatDate(day.date)}`;

  const snacksText = (Array.isArray(day.meals?.snacks) && day.meals.snacks.length) ? day.meals.snacks.join('、') : '（無）';
  document.getElementById('dayViewMeals').innerHTML =
    mealLineHtml('早餐', day.meals.breakfast || '猶豫中') +
    mealLineHtml('午餐', day.meals.lunch || '猶豫中') +
    mealLineHtml('晚餐', day.meals.dinner || '猶豫中') +
    mealLineHtml('小吃', snacksText);

  document.querySelectorAll('#dayViewMeals .meal-map-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-map-query') || '';
      if (!q) return;
      const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
      window.open(url, '_blank', 'noopener');
    });
  });

  renderDayViewSpots(day);

  document.getElementById('dayViewNote').textContent = day.dailyNote || '（無備註）';
}

function renderDayViewSpots(day) {
  const spotsEl = document.getElementById('dayViewSpots');
  spotsEl.innerHTML = '';

  if (!day.spots?.length) {
    spotsEl.textContent = '目前沒有景點';
    return;
  }

  day.spots.forEach((spot, i) => {
    if (!spot.transport) {
      spot.transport = { type: day.transport?.type || '開車', address: '', note: day.transport?.note || '' };
    }

    const row = document.createElement('div');
    row.className = 'panel spot-card';
    row.style.display = 'grid';
    row.style.gridTemplateColumns = '1fr auto auto auto';
    row.style.gap = '8px';
    row.style.alignItems = 'start';
    row.style.marginBottom = '8px';

    const info = document.createElement('div');
    const transportAddress = spot.transport.address || '';
    info.innerHTML =
      `${i + 1}. ${spot.name}（${spot.time || '未設定時間'}）<br>` +
      `${spot.address || '（無地址）'}<br>` +
      `<span class="mini-tag mini-tag-traffic">交通：${spot.transport.type || '未設定'}</span> ` +
      `<span class="mini-tag mini-tag-traffic">交通地址：${transportAddress || '（無交通地址）'}</span> ` +
      `<span class="mini-tag mini-tag-note">備註：${spot.transport.note || '（無備註）'}</span><br>` +
      `${spot.note || '（無備註）'}`;

    const transportMapBtn = document.createElement('button');
    transportMapBtn.className = 'btn btn-light';
    transportMapBtn.textContent = '交通地圖';
    transportMapBtn.addEventListener('click', () => {
      openGoogleMapByQuery(transportAddress, '此景點沒有交通地址');
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-light';
    editBtn.textContent = '編輯';
    editBtn.addEventListener('click', () => openSpotEditModal(spot));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-light';
    deleteBtn.textContent = '刪除';
    deleteBtn.addEventListener('click', async () => {
      const ok = confirm(`確定刪除景點「${spot.name}」？`);
      if (!ok) return;
      day.spots = day.spots.filter((s) => s.id !== spot.id);
      await persistTrips();
      renderDayView();
    });

    row.appendChild(info);
    row.appendChild(transportMapBtn);
    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
    spotsEl.appendChild(row);
  });
}

function openSpotEditModal(spot) {
  editingSpotId = spot.id;
  if (!spot.transport) {
    spot.transport = { type: '開車', note: '' };
  }
  renderTrafficTypeOptions();
  spotEditNameEl.value = spot.name || '';
  spotEditTimeEl.value = spot.time || '';
  spotEditAddressEl.value = spot.address || '';
  spotEditTransportTypeEl.value = spot.transport.type || '開車';
  spotEditTransportAddressEl.value = spot.transport.address || '';
  spotEditTransportNoteEl.value = spot.transport.note || '';
  spotEditNoteEl.value = spot.note || '';
  spotEditModalEl.classList.add('show');
  spotEditModalEl.setAttribute('aria-hidden', 'false');
}

function closeSpotEditModal() {
  editingSpotId = null;
  spotEditModalEl.classList.remove('show');
  spotEditModalEl.setAttribute('aria-hidden', 'true');
}

function loadDayEditor() {
  const day = currentDay();
  if (!day) return;
  renderTrafficTypeOptions();
  renderSpotTrafficPresets();
  renderMealPresets();
  ensureDaySnacks(day);
  document.getElementById('dayEditorTitle').textContent = `${day.title} ${formatDate(day.date)}`;
  document.getElementById('mealBreakfast').value = day.meals.breakfast;
  document.getElementById('mealLunch').value = day.meals.lunch;
  document.getElementById('mealDinner').value = day.meals.dinner;
  document.getElementById('mealSnackInput').value = '';
  renderSnackList(day);
  document.getElementById('transportType').value = day.transport.type;
  document.getElementById('transportAddress').value = '';
  document.getElementById('transportNote').value = day.transport.note;
  document.getElementById('dailyNote').value = day.dailyNote;
}

document.querySelectorAll('[data-go]').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.go;
    if (view === 'trips') renderTrips();
    show(view);
  });
});

document.getElementById('newTripForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const startDate = fd.get('startDate');
  const endDate = fd.get('endDate');

  if (startDate > endDate) {
    alert('回程時間不可早於出發時間');
    return;
  }

  const trip = {
    id: uid('trip'),
    name: fd.get('name').trim(),
    country: fd.get('country').trim(),
    region: fd.get('region').trim(),
    theme: normalizeTheme(fd.get('theme')),
    startDate,
    endDate,
    days: buildDays(startDate, endDate),
    todo: [],
    food: [],
    traffic: [],
    trafficTypeOptions: [...DEFAULT_TRAFFIC_TYPES]
  };

  state.trips.push(trip);
  persistTrips();
  state.currentTripId = trip.id;
  setActiveTheme(trip.theme);
  document.getElementById('tripMainTitle').textContent = trip.name;
  renderSnapshotList();
  e.target.reset();
  show('trip-main');
});

document.getElementById('createSnapshotBtn').addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip) return;
  const snapshot = {
    id: uid('snapshot'),
    tripId: trip.id,
    tripName: trip.name,
    label: `${trip.name}｜${nowLabel()}`,
    createdAt: new Date().toISOString(),
    tripData: deepClone(trip)
  };
  state.snapshots.push(snapshot);
  await saveSnapshotToDb(snapshot);
  renderSnapshotList();
  alert('已建立快照');
});

document.getElementById('openSchedule').addEventListener('click', () => {
  renderDays();
  show('schedule-days');
});

document.getElementById('openScheduleAdjust').addEventListener('click', () => {
  const trip = currentTrip();
  if (!trip) return;
  const rsStart = document.getElementById('rescheduleStartDate');
  const rsEnd = document.getElementById('rescheduleEndDate');
  if (rsStart) rsStart.value = trip.startDate || '';
  if (rsEnd) rsEnd.value = trip.endDate || '';
  renderSwapDayOptions(trip);
  show('schedule-adjust-view');
});

document.getElementById('backToScheduleDays').addEventListener('click', () => {
  renderDays();
  show('schedule-days');
});

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatLocalDate(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calcInclusiveDays(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const diffMs = end - start;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

document.getElementById('applyRescheduleBtn').addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip) return;

  const newStart = document.getElementById('rescheduleStartDate').value;
  const newEnd = document.getElementById('rescheduleEndDate').value;
  if (!newStart || !newEnd) {
    alert('請先輸入開始與結束日期');
    return;
  }
  if (newStart > newEnd) {
    alert('結束日期不可早於開始日期');
    return;
  }

  const oldDays = calcInclusiveDays(trip.startDate, trip.endDate);
  const newDays = calcInclusiveDays(newStart, newEnd);
  if (oldDays !== newDays) {
    alert(`總天數需維持 ${oldDays} 天，目前是 ${newDays} 天`);
    return;
  }

  const start = parseLocalDate(newStart);
  trip.days.forEach((day, idx) => {
    const d = new Date(start);
    d.setDate(start.getDate() + idx);
    day.date = formatLocalDate(d);
  });
  trip.startDate = newStart;
  trip.endDate = newEnd;

  await persistTrips();
  renderDays();
  alert('已重新安排日期');
});

document.getElementById('applySwapDayBtn').addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip) return;
  const fromIdx = Number(document.getElementById('swapDayFrom').value);
  const toIdx = Number(document.getElementById('swapDayTo').value);

  if (!Number.isInteger(fromIdx) || !Number.isInteger(toIdx)) {
    alert('請選擇要互換的 Day');
    return;
  }
  if (fromIdx === toIdx) {
    alert('來源與目標 Day 不可相同');
    return;
  }
  if (fromIdx < 0 || toIdx < 0 || fromIdx >= trip.days.length || toIdx >= trip.days.length) {
    alert('Day 選擇超出範圍');
    return;
  }

  const fromDay = trip.days[fromIdx];
  const toDay = trip.days[toIdx];
  const ok = confirm(`確定互換 ${fromDay.title} 與 ${toDay.title} 的行程內容？`);
  if (!ok) return;

  const fields = ['meals', 'spots', 'transport', 'dailyNote'];
  fields.forEach((key) => {
    const temp = fromDay[key];
    fromDay[key] = toDay[key];
    toDay[key] = temp;
  });

  await persistTrips();
  renderDays();
  alert('已完成天數互換');
});

document.getElementById('exportTripPdfBtn').addEventListener('click', () => {
  const trip = currentTrip();
  if (!trip) return;
  const printContentEl = document.getElementById('printContent');
  printContentEl.innerHTML = buildTripPrintHtml(trip);
  show('print-view');
  setTimeout(() => {
    window.print();
  }, 50);
});

document.getElementById('backFromPrint').addEventListener('click', () => show('trip-main'));

document.getElementById('openTodo').addEventListener('click', () => {
  renderTodo();
  show('todo-view');
});

document.getElementById('openFood').addEventListener('click', () => {
  renderFood();
  show('food-view');
});

document.getElementById('backToTripMainFromFood').addEventListener('click', () => show('trip-main'));

foodRegionFilterEl.addEventListener('change', renderFood);

document.getElementById('addFoodBtn').addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip) return;
  ensureFood(trip);

  const region = foodRegionInputEl.value.trim();
  const name = foodNameInputEl.value.trim();
  const address = foodAddressInputEl.value.trim();
  const bookingTime = foodBookingTimeInputEl.value;
  const booked = foodBookedInputEl.value;
  const note = foodNoteInputEl.value.trim();

  if (!name) {
    alert('請輸入餐廳名稱');
    return;
  }

  trip.food.push({
    id: uid('food'),
    region,
    name,
    address,
    bookingTime,
    booked,
    note
  });

  foodRegionInputEl.value = '';
  foodNameInputEl.value = '';
  foodAddressInputEl.value = '';
  foodBookingTimeInputEl.value = '';
  foodBookedInputEl.value = '未訂位';
  foodNoteInputEl.value = '';
  await persistTrips();
  renderFood();
  renderMealPresets();
});
foodEditCancelBtnEl.addEventListener('click', closeFoodEditModal);
foodEditSaveBtnEl.addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip || !editingFoodId) return;
  const item = trip.food.find((f) => f.id === editingFoodId);
  if (!item) return;

  const name = foodEditNameEl.value.trim();
  if (!name) {
    alert('請輸入餐廳名稱');
    return;
  }

  item.region = foodEditRegionEl.value.trim();
  item.name = name;
  item.address = foodEditAddressEl.value.trim();
  item.bookingTime = foodEditBookingTimeEl.value;
  item.booked = foodEditBookedEl.value;
  item.note = foodEditNoteEl.value.trim();

  await persistTrips();
  closeFoodEditModal();
  renderFood();
  renderMealPresets();
});

document.getElementById('openTraffic').addEventListener('click', () => {
  renderTraffic();
  show('traffic-view');
});

document.getElementById('backToTripMainFromTraffic').addEventListener('click', () => show('trip-main'));

addTrafficTypeBtnEl.addEventListener('click', addCustomTrafficType);
trafficCustomTypeInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addCustomTrafficType();
  }
});

document.getElementById('addTrafficBtn').addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip) return;
  ensureTraffic(trip);

  const type = trafficTypeInputEl.value;
  const note = trafficNoteInputEl.value.trim();
  const booking = trafficBookingInputEl.value;
  const rideTime = trafficRideTimeInputEl.value;
  const payment = trafficPaymentInputEl.value;
  trip.traffic.push({
    id: uid('traffic'),
    type,
    note,
    booking,
    rideTime,
    payment
  });
  trafficNoteInputEl.value = '';
  trafficBookingInputEl.value = '未訂購';
  trafficRideTimeInputEl.value = '';
  trafficPaymentInputEl.value = '未付款';
  await persistTrips();
  renderTraffic();
  renderTrafficTypeManageList();
  renderSpotTrafficPresets();
});

document.getElementById('applySpotTrafficPresetBtn').addEventListener('click', () => {
  const trip = currentTrip();
  if (!trip) return;
  ensureTraffic(trip);
  const selectEl = document.getElementById('spotTrafficPresetSelect');
  if (selectEl.value === '') {
    alert('請先選擇要套用的交通規劃項目');
    return;
  }
  const idx = Number(selectEl.value);
  if (!Number.isInteger(idx) || idx < 0 || idx >= trip.traffic.length) {
    alert('選擇的交通規劃項目無效');
    return;
  }

  const item = trip.traffic[idx];
  document.getElementById('transportType').value = item.type || '開車';
  document.getElementById('transportNote').value = item.note || '';
});

document.getElementById('openSpotMapBtn').addEventListener('click', () => {
  const spotName = document.getElementById('spotName').value.trim();
  if (!spotName) {
    alert('請先輸入景點名稱');
    return;
  }
  const spotAddress = document.getElementById('spotAddress').value.trim();
  const query = spotAddress ? `${spotName} ${spotAddress}` : spotName;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  window.open(url, '_blank', 'noopener');
});

document.getElementById('openTransportMapBtn').addEventListener('click', () => {
  openGoogleMapByQuery(document.getElementById('transportAddress').value, '請先輸入交通地址');
});

spotEditTransportMapBtnEl.addEventListener('click', () => {
  openGoogleMapByQuery(spotEditTransportAddressEl.value, '請先輸入交通地址');
});

document.getElementById('applyMealPresetBtn').addEventListener('click', () => {
  const trip = currentTrip();
  if (!trip) return;
  ensureFood(trip);
  const presetEl = document.getElementById('mealPresetSelect');
  const targetEl = document.getElementById('mealTargetSelect');

  if (presetEl.value === '') {
    alert('請先選擇要套用的美食規劃項目');
    return;
  }

  const idx = Number(presetEl.value);
  if (!Number.isInteger(idx) || idx < 0 || idx >= trip.food.length) {
    alert('選擇的美食規劃項目無效');
    return;
  }

  const item = trip.food[idx];
  const region = item.region ? `${item.region} ` : '';
  const name = item.name || '未命名餐廳';
  const booked = item.booked || '未訂位';
  const text = `${region}${name} [${booked}]`;

  const target = targetEl.value;
  if (target === 'breakfast') {
    document.getElementById('mealBreakfast').value = text;
  } else if (target === 'lunch') {
    document.getElementById('mealLunch').value = text;
  } else if (target === 'snack') {
    const day = currentDay();
    if (!day) return;
    ensureDaySnacks(day);
    day.meals.snacks.push(text);
    renderSnackList(day);
  } else {
    document.getElementById('mealDinner').value = text;
  }
});

document.getElementById('addSnackBtn').addEventListener('click', () => {
  const day = currentDay();
  if (!day) return;
  ensureDaySnacks(day);
  const inputEl = document.getElementById('mealSnackInput');
  const v = inputEl.value.trim();
  if (!v) {
    alert('請輸入小吃內容');
    return;
  }
  day.meals.snacks.push(v);
  inputEl.value = '';
  renderSnackList(day);
});

document.getElementById('backToTripMainFromTodo').addEventListener('click', () => show('trip-main'));

document.getElementById('addTodoBtn').addEventListener('click', async () => {
  const trip = currentTrip();
  if (!trip) return;
  ensureTodo(trip);

  const text = todoInputEl.value.trim();
  if (!text) {
    alert('請輸入待辦內容');
    return;
  }

  trip.todo.push({ id: uid('todo'), text, done: false });
  todoInputEl.value = '';
  await persistTrips();
  renderTodo();
});

document.getElementById('backToTripMain').addEventListener('click', () => show('trip-main'));
document.getElementById('backToDays').addEventListener('click', () => show('schedule-days'));
document.getElementById('backToDaysFromView').addEventListener('click', () => show('schedule-days'));
document.getElementById('editDayFromView').addEventListener('click', () => {
  loadDayEditor();
  show('day-editor');
});
spotEditCancelBtnEl.addEventListener('click', closeSpotEditModal);
spotEditSaveBtnEl.addEventListener('click', async () => {
  const day = currentDay();
  if (!day || !editingSpotId) return;
  const spot = day.spots.find((s) => s.id === editingSpotId);
  if (!spot) return;

  const name = spotEditNameEl.value.trim();
  if (!name) {
    alert('景點名稱不可空白');
    return;
  }

  spot.name = name;
  spot.time = spotEditTimeEl.value.trim();
  spot.address = spotEditAddressEl.value.trim();
  spot.transport = {
    type: spotEditTransportTypeEl.value,
    address: spotEditTransportAddressEl.value.trim(),
    note: spotEditTransportNoteEl.value.trim()
  };
  spot.note = spotEditNoteEl.value.trim();

  await persistTrips();
  closeSpotEditModal();
  renderDayView();
});

document.getElementById('confirmSpot').addEventListener('click', () => {
  const day = currentDay();
  if (!day) return;

  const spot = {
    id: uid('spot'),
    name: document.getElementById('spotName').value.trim(),
    time: document.getElementById('spotTime').value,
    address: document.getElementById('spotAddress').value.trim(),
    transport: {
      type: document.getElementById('transportType').value,
      address: document.getElementById('transportAddress').value.trim(),
      note: document.getElementById('transportNote').value.trim()
    },
    note: document.getElementById('spotNote').value.trim(),
    confirmed: false
  };

  if (!spot.name) {
    alert('請輸入景點名稱');
    return;
  }

  day.spots.push(spot);
  persistTrips();
  const next = confirm('是否要繼續編輯下一筆景點？');
  if (next) {
    document.getElementById('spotName').value = '';
    document.getElementById('spotTime').value = '';
    document.getElementById('spotAddress').value = '';
    document.getElementById('spotNote').value = '';
    document.getElementById('transportAddress').value = '';
    const transportTypeEl = document.getElementById('transportType');
    if (transportTypeEl && transportTypeEl.options.length > 0) {
      transportTypeEl.selectedIndex = 0;
    }
    document.getElementById('transportNote').value = '';
  } else {
    show('day-editor');
  }
});

document.getElementById('saveDay').addEventListener('click', () => {
  const day = currentDay();
  if (!day) return;

  day.meals.breakfast = document.getElementById('mealBreakfast').value.trim() || '猶豫中';
  day.meals.lunch = document.getElementById('mealLunch').value.trim() || '猶豫中';
  day.meals.dinner = document.getElementById('mealDinner').value.trim() || '猶豫中';
  ensureDaySnacks(day);
  day.transport.type = document.getElementById('transportType').value;
  day.transport.note = document.getElementById('transportNote').value.trim();
  if (Array.isArray(day.spots)) {
    day.spots.forEach((spot) => {
      if (!spot.transport) {
        spot.transport = {
          type: day.transport.type,
          note: day.transport.note
        };
      }
    });
  }
  day.dailyNote = document.getElementById('dailyNote').value.trim();
  persistTrips();

  alert('已儲存當天行程');
  renderDayView();
  show('day-view');
});

exportJsonBtn.addEventListener('click', () => {
  const filename = `my-travel-backup-${backupDate()}.json`;
  downloadJson(filename, { trips: state.trips });
});

importJsonBtn.addEventListener('click', () => {
  importJsonFile.value = '';
  importJsonFile.click();
});

importJsonFile.addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.trips)) {
      alert('JSON 格式錯誤：缺少 trips 陣列');
      return;
    }

    state.trips = parsed.trips;
    state.trips.forEach((trip) => {
      trip.theme = normalizeTheme(trip.theme);
    });
    state.currentTripId = null;
    state.currentDayId = null;
    await persistTrips();
    renderTrips();
    alert('匯入成功');
  } catch {
    alert('匯入失敗，請確認 JSON 內容');
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

async function init() {
  try {
    state.trips = await loadTripsFromDb();
    state.trips.forEach((trip) => {
      trip.theme = normalizeTheme(trip.theme);
    });
    state.snapshots = await loadSnapshotsFromDb();
  } catch {
    state.trips = [];
    state.snapshots = [];
  }
  setActiveTheme('mediterranean');
}

init();


const state = {
  trips: [],
  currentTripId: null,
  currentDayId: null
};

const views = [...document.querySelectorAll('.view')];
const tripListEl = document.getElementById('tripList');
const dayListEl = document.getElementById('dayList');

function uid(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`;
}

function show(viewId) {
  views.forEach(v => v.classList.toggle('active', v.id === viewId));
}

function formatDate(dateStr) {
  return dateStr.replaceAll('-', '/');
}

function buildDays(startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = [];
  let i = 1;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    days.push({
      id: uid('day'),
      date: iso,
      title: `Day ${i}`,
      meals: { breakfast: '猶豫中', lunch: '猶豫中', dinner: '猶豫中' },
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

function currentDay() {
  const trip = currentTrip();
  if (!trip) return null;
  return trip.days.find(d => d.id === state.currentDayId);
}

function renderTrips() {
  tripListEl.innerHTML = '';
  if (!state.trips.length) {
    tripListEl.innerHTML = '<div class="panel">目前沒有旅程</div>';
    return;
  }

  state.trips.forEach(trip => {
    const btn = document.createElement('button');
    btn.className = 'btn panel';
    btn.innerHTML = `<strong>${trip.name}</strong><br>${trip.country}｜${trip.region}<br>${trip.startDate} - ${trip.endDate}`;
    btn.addEventListener('click', () => {
      state.currentTripId = trip.id;
      document.getElementById('tripMainTitle').textContent = trip.name;
      show('trip-main');
    });
    tripListEl.appendChild(btn);
  });
}

function renderDays() {
  const trip = currentTrip();
  dayListEl.innerHTML = '';
  if (!trip) return;

  trip.days.forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'btn panel';
    btn.textContent = `${day.title}：${formatDate(day.date)}`;
    btn.addEventListener('click', () => {
      state.currentDayId = day.id;
      loadDayEditor();
      show('day-editor');
    });
    dayListEl.appendChild(btn);
  });
}

function loadDayEditor() {
  const day = currentDay();
  if (!day) return;
  document.getElementById('dayEditorTitle').textContent = `${day.title} ${formatDate(day.date)}`;
  document.getElementById('mealBreakfast').value = day.meals.breakfast;
  document.getElementById('mealLunch').value = day.meals.lunch;
  document.getElementById('mealDinner').value = day.meals.dinner;
  document.getElementById('transportType').value = day.transport.type;
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
    startDate,
    endDate,
    days: buildDays(startDate, endDate),
    todo: [],
    food: [],
    traffic: []
  };

  state.trips.push(trip);
  state.currentTripId = trip.id;
  document.getElementById('tripMainTitle').textContent = trip.name;
  e.target.reset();
  show('trip-main');
});

document.getElementById('openSchedule').addEventListener('click', () => {
  renderDays();
  show('schedule-days');
});

document.getElementById('backToTripMain').addEventListener('click', () => show('trip-main'));
document.getElementById('backToDays').addEventListener('click', () => show('schedule-days'));

document.getElementById('confirmSpot').addEventListener('click', () => {
  const day = currentDay();
  if (!day) return;

  const spot = {
    id: uid('spot'),
    name: document.getElementById('spotName').value.trim(),
    time: document.getElementById('spotTime').value,
    address: document.getElementById('spotAddress').value.trim(),
    note: document.getElementById('spotNote').value.trim(),
    confirmed: false
  };

  if (!spot.name) {
    alert('請輸入景點名稱');
    return;
  }

  day.spots.push(spot);
  const next = confirm('是否要繼續編輯下一筆景點？');
  if (next) {
    document.getElementById('spotName').value = '';
    document.getElementById('spotTime').value = '';
    document.getElementById('spotAddress').value = '';
    document.getElementById('spotNote').value = '';
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
  day.transport.type = document.getElementById('transportType').value;
  day.transport.note = document.getElementById('transportNote').value.trim();
  day.dailyNote = document.getElementById('dailyNote').value.trim();

  alert('已儲存當天行程');
  show('schedule-days');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

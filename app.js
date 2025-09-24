// Simple PWA Calorie Counter using localStorage
const $ = (s) => document.querySelector(s);
const todayStr = () => new Date().toISOString().slice(0,10);

let db = JSON.parse(localStorage.getItem('cc_db_v1') || '{}');
let settings = JSON.parse(localStorage.getItem('cc_settings_v1') || '{"goal":null}');

function save() {
  localStorage.setItem('cc_db_v1', JSON.stringify(db));
  localStorage.setItem('cc_settings_v1', JSON.stringify(settings));
}

function ensureDay(dateStr) {
  if (!db[dateStr]) db[dateStr] = { entries: [] };
}

function render(dateStr) {
  ensureDay(dateStr);
  const day = db[dateStr];
  const list = $('#list');
  list.innerHTML = '';

  let total = 0;
  day.entries.forEach((e, idx) => {
    total += Number(e.calories || 0);
    const li = document.createElement('li');

    const left = document.createElement('div');
    left.innerHTML = `<strong>${e.food || 'Item'}</strong><br>
      <small class="muted">${e.calories} kcal • P ${e.protein||0}g • C ${e.carbs||0}g • F ${e.fat||0}g</small>`;

    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.className = 'danger';
    del.onclick = () => {
      day.entries.splice(idx,1);
      save(); render(dateStr);
    };

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    const kcal = document.createElement('span');
    kcal.className = 'badge';
    kcal.textContent = `${e.calories} kcal`;

    li.appendChild(left);
    li.appendChild(kcal);
    li.appendChild(badge);
    li.appendChild(del);
    list.appendChild(li);
  });

  // Summary
  $('#totalCals').textContent = total;
  $('#goalCals').textContent = settings.goal ?? '—';
  const rem = (settings.goal != null) ? (Number(settings.goal) - total) : null;
  $('#remainingCals').textContent = (rem == null) ? '—' : rem;
  const pct = (settings.goal && settings.goal > 0) ? Math.min(100, Math.max(0, (total/settings.goal)*100)) : 0;
  $('#bar').style.width = pct + '%';

  // Labels and inputs
  $('#dateLabel').textContent = new Date(dateStr).toLocaleDateString();
  $('#filterDate').value = dateStr;
  $('#entryDate').value = dateStr;
  $('#goalInput').value = settings.goal ?? '';
}

window.addEventListener('DOMContentLoaded', () => {
  // Initial date defaults
  const t = todayStr();
  if (!db[t]) ensureDay(t);
  render(t);

  // Add entry
  $('#add').addEventListener('click', () => {
    const food = $('#food').value.trim();
    const calories = Number($('#calories').value || 0);
    const protein = Number($('#protein').value || 0);
    const carbs = Number($('#carbs').value || 0);
    const fat = Number($('#fat').value || 0);
    const date = $('#entryDate').value || todayStr();

    if (!calories || calories < 0) { alert('Enter calories.'); return; }
    ensureDay(date);
    db[date].entries.unshift({ food, calories, protein, carbs, fat, timestamp: new Date().toISOString() });
    save();
    render($('#filterDate').value || date);

    // Clear inputs
    $('#food').value = '';
    $('#calories').value = '';
    $('#protein').value = '';
    $('#carbs').value = '';
    $('#fat').value = '';
  });

  // Save goal
  $('#saveGoal').addEventListener('click', () => {
    const g = $('#goalInput').value;
    settings.goal = g === '' ? null : Number(g);
    save();
    render($('#filterDate').value || todayStr());
  });

  // Filter by date
  $('#filterDate').addEventListener('change', (e) => render(e.target.value || todayStr()));
  $('#todayBtn').addEventListener('click', () => render(todayStr()));

  // Clear day
  $('#clearAll').addEventListener('click', () => {
    const d = $('#filterDate').value || todayStr();
    if (confirm('Delete all entries for this day?')) {
      ensureDay(d);
      db[d].entries = [];
      save();
      render(d);
    }
  });

  // Export / Import
  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ db, settings }, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calorie_counter_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  $('#importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const obj = JSON.parse(text);
      if (obj.db) db = obj.db;
      if (obj.settings) settings = obj.settings;
      save();
      render($('#filterDate').value || todayStr());
      alert('Import successful.');
    } catch {
      alert('Invalid file.');
    }
  });

  // Install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = $('#installBtn');
    btn.hidden = false;
    btn.addEventListener('click', async () => {
      btn.hidden = true;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      }
    });
  });
});

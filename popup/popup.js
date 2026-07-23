const YWT_HISTORY_KEY = 'ywt_history';
const YWT_SETTINGS_KEY = 'ywt_settings';
const YWT_DEFAULT_SETTINGS = { limitMinutes: 120, color: '#ff0000', fontSize: 54 };

async function getSettings() {
  const store = await chrome.storage.local.get(YWT_SETTINGS_KEY);
  return { ...YWT_DEFAULT_SETTINGS, ...(store[YWT_SETTINGS_KEY] || {}) };
}

async function saveSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await chrome.storage.local.set({ [YWT_SETTINGS_KEY]: updated });
}

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

async function getHistory() {
  const store = await chrome.storage.local.get(YWT_HISTORY_KEY);
  return store[YWT_HISTORY_KEY] || {};
}

function sortedDates(history) {
  return Object.keys(history).sort().reverse();
}

async function renderTable() {
  const history = await getHistory();
  const settings = await getSettings();
  const dates = sortedDates(history);
  const body = document.getElementById('history-body');
  const emptyMsg = document.getElementById('empty-msg');
  const table = document.getElementById('history-table');

  body.innerHTML = '';
  if (dates.length === 0) {
    table.hidden = true;
    emptyMsg.hidden = false;
    return;
  }
  table.hidden = false;
  emptyMsg.hidden = true;

  for (const date of dates) {
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    dateCell.textContent = date;
    const timeCell = document.createElement('td');
    timeCell.className = 'time';
    timeCell.style.color = settings.color;
    timeCell.textContent = formatDuration(history[date]);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    body.appendChild(row);
  }
}

async function initSettingsForm() {
  const settings = await getSettings();
  const limitInput = document.getElementById('limit-input');
  const colorInput = document.getElementById('color-input');
  const sizeInput = document.getElementById('size-input');
  const sizeValue = document.getElementById('size-value');

  limitInput.value = settings.limitMinutes;
  colorInput.value = settings.color;
  sizeInput.value = settings.fontSize;
  sizeValue.textContent = `${settings.fontSize}px`;

  limitInput.addEventListener('input', () => {
    const minutes = Math.max(0, Number(limitInput.value) || 0);
    saveSettings({ limitMinutes: minutes });
  });

  colorInput.addEventListener('input', () => {
    saveSettings({ color: colorInput.value });
    renderTable();
  });

  sizeInput.addEventListener('input', () => {
    const size = Number(sizeInput.value);
    sizeValue.textContent = `${size}px`;
    saveSettings({ fontSize: size });
  });
}

async function exportCsv() {
  const history = await getHistory();
  const dates = sortedDates(history).reverse();
  const lines = ['date,seconds,hh:mm:ss'];
  for (const date of dates) {
    const seconds = Math.floor(history[date]);
    lines.push(`${date},${seconds},${formatDuration(seconds)}`);
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'youtube-watch-time-history.csv';
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('export-btn').addEventListener('click', exportCsv);
renderTable();
initSettingsForm();

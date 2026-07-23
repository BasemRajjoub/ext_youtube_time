const YWT_HISTORY_KEY = 'ywt_history';

function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
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
    timeCell.textContent = formatDuration(history[date]);
    row.appendChild(dateCell);
    row.appendChild(timeCell);
    body.appendChild(row);
  }
}

async function exportCsv() {
  const history = await getHistory();
  const dates = sortedDates(history).reverse();
  const lines = ['date,seconds,hh:mm'];
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

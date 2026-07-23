const YWT_HISTORY_KEY = 'ywt_history';
const YWT_SETTINGS_KEY = 'ywt_settings';
const YWT_DEFAULT_SETTINGS = { limitMinutes: 120, color: '#ff0000', fontSize: 54 };

async function ywtGetSettings() {
  const store = await chrome.storage.local.get(YWT_SETTINGS_KEY);
  return { ...YWT_DEFAULT_SETTINGS, ...(store[YWT_SETTINGS_KEY] || {}) };
}

function ywtTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function ywtGetHistory() {
  const store = await chrome.storage.local.get(YWT_HISTORY_KEY);
  return store[YWT_HISTORY_KEY] || {};
}

async function ywtGetTodaySeconds() {
  const history = await ywtGetHistory();
  return history[ywtTodayKey()] || 0;
}

async function ywtFlush(deltaSec) {
  const history = await ywtGetHistory();
  const key = ywtTodayKey();
  history[key] = (history[key] || 0) + deltaSec;
  await chrome.storage.local.set({ [YWT_HISTORY_KEY]: history });
  return history[key];
}

const YWT_KEY = 'ywt_watch_today';

function ywtTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function ywtGetRecord() {
  const store = await chrome.storage.local.get(YWT_KEY);
  return store[YWT_KEY] || null;
}

async function ywtFlush(deltaSec) {
  const rec = await ywtGetRecord();
  const key = ywtTodayKey();
  const seconds = (rec && rec.date === key) ? rec.seconds + deltaSec : deltaSec;
  const updated = { date: key, seconds };
  await chrome.storage.local.set({ [YWT_KEY]: updated });
  return updated;
}

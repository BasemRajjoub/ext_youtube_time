const YWT_LOGO_SELECTORS = [
  'ytd-masthead #start #logo',
  'ytd-masthead #logo',
  '#logo-icon',
  'ytd-topbar-logo-renderer'
];

let ywtDisplayedRecord = { date: '', seconds: 0 };
let ywtPendingInject = false;
let ywtSettings = { ...YWT_DEFAULT_SETTINGS };

function ywtFormatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function ywtFindLogoContainer() {
  for (const sel of YWT_LOGO_SELECTORS) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

function ywtEnsureBadgeInjected() {
  if (document.getElementById('ywt-badge')) return;
  const logo = ywtFindLogoContainer();
  if (!logo || !logo.parentElement) return;
  const badge = document.createElement('span');
  badge.id = 'ywt-badge';
  badge.className = 'ywt-badge';
  badge.textContent = '0:00';
  logo.parentElement.insertBefore(badge, logo.nextSibling);
}

function ywtScheduleInject() {
  if (ywtPendingInject) return;
  ywtPendingInject = true;
  requestAnimationFrame(() => {
    ywtPendingInject = false;
    ywtEnsureBadgeInjected();
  });
}

const ywtObserver = new MutationObserver(ywtScheduleInject);
ywtObserver.observe(document.body, { childList: true, subtree: true });
document.addEventListener('yt-navigate-finish', ywtScheduleInject);
ywtScheduleInject();

async function ywtRefreshFromStorage() {
  const seconds = await ywtGetTodaySeconds();
  ywtDisplayedRecord = { date: ywtTodayKey(), seconds };
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  if (changes[YWT_HISTORY_KEY]) {
    const newHistory = changes[YWT_HISTORY_KEY].newValue || {};
    const key = ywtTodayKey();
    ywtDisplayedRecord = { date: key, seconds: newHistory[key] || 0 };
  }
  if (changes[YWT_SETTINGS_KEY]) {
    ywtSettings = { ...YWT_DEFAULT_SETTINGS, ...(changes[YWT_SETTINGS_KEY].newValue || {}) };
  }
});

ywtRefreshFromStorage();
ywtGetSettings().then((s) => { ywtSettings = s; });

setInterval(() => {
  const key = ywtTodayKey();
  if (ywtDisplayedRecord.date !== key) {
    ywtDisplayedRecord = { date: key, seconds: 0 };
  }

  const badge = document.getElementById('ywt-badge');
  if (!badge) return;

  const liveExtra = (ywtIsTracking) ? (performance.now() - ywtSegmentStartMs) / 1000 : 0;
  const totalSeconds = ywtDisplayedRecord.seconds + ywtPendingDeltaSec + liveExtra;

  badge.textContent = ywtFormatDuration(totalSeconds);
  badge.style.color = ywtSettings.color;
  badge.style.fontSize = `${ywtSettings.fontSize}px`;

  const limitSeconds = ywtSettings.limitMinutes * 60;
  const overLimit = limitSeconds > 0 && totalSeconds >= limitSeconds;
  badge.classList.toggle('ywt-over-limit', overLimit);

  const limitStr = ywtFormatDuration(limitSeconds);
  badge.title = overLimit
    ? `Today: ${ywtFormatDuration(totalSeconds)}\nDaily limit ${limitStr} exceeded!`
    : `Today: ${ywtFormatDuration(totalSeconds)}\nDaily limit: ${limitStr}`;
}, 1000);

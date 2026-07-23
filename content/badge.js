const YWT_LOGO_SELECTORS = [
  'ytd-masthead #start #logo',
  'ytd-masthead #logo',
  '#logo-icon',
  'ytd-topbar-logo-renderer'
];

let ywtDisplayedRecord = { date: '', seconds: 0 };
let ywtPendingInject = false;

function ywtFormatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, '0')}`;
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
  if (area !== 'local' || !changes[YWT_HISTORY_KEY]) return;
  const newHistory = changes[YWT_HISTORY_KEY].newValue || {};
  const key = ywtTodayKey();
  ywtDisplayedRecord = { date: key, seconds: newHistory[key] || 0 };
});

ywtRefreshFromStorage();

setInterval(() => {
  const key = ywtTodayKey();
  if (ywtDisplayedRecord.date !== key) {
    ywtDisplayedRecord = { date: key, seconds: 0 };
  }

  const badge = document.getElementById('ywt-badge');
  if (!badge) return;

  const liveExtra = (ywtIsTracking) ? (performance.now() - ywtSegmentStartMs) / 1000 : 0;
  badge.textContent = ywtFormatDuration(ywtDisplayedRecord.seconds + ywtPendingDeltaSec + liveExtra);
}, 1000);

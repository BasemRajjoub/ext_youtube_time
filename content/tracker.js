let ywtIsTracking = false;
let ywtSegmentStartMs = 0;
let ywtPendingDeltaSec = 0;
let ywtBoundVideo = null;

function ywtIsAdPlaying() {
  const player = document.querySelector('#movie_player');
  return player ? player.classList.contains('ad-showing') : false;
}

function ywtOnPlay() {
  if (ywtIsTracking || ywtIsAdPlaying()) return;
  ywtIsTracking = true;
  ywtSegmentStartMs = performance.now();
}

function ywtCloseSegment() {
  if (!ywtIsTracking) return;
  ywtPendingDeltaSec += (performance.now() - ywtSegmentStartMs) / 1000;
  ywtIsTracking = false;
}

function ywtOnPauseOrEnded() {
  ywtCloseSegment();
  ywtFlushPending();
}

function ywtFindPrimaryVideo() {
  return document.querySelector('#movie_player video');
}

function ywtEnsureVideoBound() {
  const video = ywtFindPrimaryVideo();
  if (!video || video === ywtBoundVideo) return;

  if (ywtBoundVideo) {
    ywtBoundVideo.removeEventListener('play', ywtOnPlay);
    ywtBoundVideo.removeEventListener('pause', ywtOnPauseOrEnded);
    ywtBoundVideo.removeEventListener('ended', ywtOnPauseOrEnded);
  }

  video.addEventListener('play', ywtOnPlay);
  video.addEventListener('pause', ywtOnPauseOrEnded);
  video.addEventListener('ended', ywtOnPauseOrEnded);
  ywtBoundVideo = video;

  if (!video.paused) ywtOnPlay();
}

async function ywtFlushPending() {
  if (ywtIsTracking) {
    const now = performance.now();
    ywtPendingDeltaSec += (now - ywtSegmentStartMs) / 1000;
    ywtSegmentStartMs = now;
  }
  if (ywtPendingDeltaSec > 0) {
    const delta = ywtPendingDeltaSec;
    ywtPendingDeltaSec = 0;
    await ywtFlush(delta);
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') ywtFlushPending();
});

setInterval(ywtEnsureVideoBound, 1000);
setInterval(ywtFlushPending, 5000);

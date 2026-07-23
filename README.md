# YouTube Watch Time

Chrome/Brave extension. Shows a red badge next to the YouTube logo with today's cumulative video watch time (`H:MM:SS`). Counts only actual video playback (pauses/ads excluded), resets at local midnight, and keeps a full daily history you can view or export as CSV.

## Features

- Live badge next to the YouTube logo, updates every second
- Daily history, viewable in the popup, exportable to CSV
- Configurable badge color, size, and a daily time limit (badge pulses + tooltip warns once exceeded)
- Persists across browser restarts (`chrome.storage.local`)

## Install (unpacked)

1. `brave://extensions` (or `chrome://extensions`)
2. Enable **Developer mode**
3. **Load unpacked** → select this folder

## Files

- `manifest.json` — Manifest V3 config
- `content/` — content scripts injected on youtube.com (tracking, storage, badge rendering)
- `popup/` — toolbar popup (history table, CSV export, settings)

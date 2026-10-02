// Timed results: ms <-> "h:mm:ss.s" (mirrors App\\Services\\Competition\\TimeResults).
export function formatMs(ms) {
  if (ms === null || ms === undefined) return '';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const frac = ms % 1000;
  const sec = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0') + (frac ? '.' + String(frac).padStart(3, '0').replace(/0+$/, '') : '');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** "25:13" | "1:02:03.4" | "48.2" -> ms; null when empty; NaN when invalid. */
export function parseTime(value) {
  const v = String(value ?? '').trim().replace(',', '.');
  if (!v) return null;
  const parts = v.split(':');
  if (parts.length > 3 || parts.some((p) => p === '' || !/^\d+(\.\d{1,3})?$/.test(p))) return NaN;
  const sec = Number(parts.pop());
  const min = parts.length ? Number(parts.pop()) : 0;
  const hrs = parts.length ? Number(parts.pop()) : 0;
  if ((v.includes(':') && sec >= 60) || (hrs && min > 59)) return NaN;
  return Math.round(((hrs * 60 + min) * 60 + sec) * 1000);
}

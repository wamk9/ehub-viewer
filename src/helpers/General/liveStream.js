// Live stream links: organizers paste whatever is in their browser (a video,
// a /live/ link, a channel page or just "@handle"). These helpers turn that into
// something storable, a link to open and, when possible, an embeddable player.

const YT_ID = /^[\w-]{11}$/;

/** Twitch: "twitch.tv/name", "https://www.twitch.tv/name" or "name" → "name". */
export function parseTwitch(value) {
  const s = String(value || '').trim();
  if (!s) return null;
  const m = s.match(/twitch\.tv\/(?:videos\/)?([\w]+)/i);
  const name = (m ? m[1] : s.replace(/^@/, '')).trim();
  return /^\w{2,40}$/.test(name) ? name : null;
}

/**
 * YouTube → { videoId } | { channelId } | { handle } | null.
 * Only videos (including live videos) and channel ids can be embedded.
 */
export function parseYouTube(value) {
  const s = String(value || '').trim();
  if (!s) return null;
  let m = s.match(/[?&]v=([\w-]{11})/) || s.match(/youtu\.be\/([\w-]{11})/) || s.match(/youtube\.com\/(?:live|embed|shorts)\/([\w-]{11})/);
  if (m) return { videoId: m[1] };
  m = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/) || s.match(/^(UC[\w-]{22})$/);
  if (m) return { channelId: m[1] };
  m = s.match(/youtube\.com\/@([\w.-]+)/) || s.match(/^@?([\w.-]{3,})$/);
  if (m && !YT_ID.test(s)) return { handle: m[1] };
  if (YT_ID.test(s)) return { videoId: s };
  return null;
}

/** Canonical value saved on the event (fits the 120-char column). */
export function normalizeYouTube(value) {
  const p = parseYouTube(value);
  if (!p) return null;
  if (p.videoId) return 'https://www.youtube.com/watch?v=' + p.videoId;
  if (p.channelId) return 'https://www.youtube.com/channel/' + p.channelId;
  return '@' + p.handle;
}

export function watchUrl(kind, value) {
  if (kind === 'twitch') {
    const ch = parseTwitch(value);
    return ch ? 'https://www.twitch.tv/' + ch : null;
  }
  const p = parseYouTube(value);
  if (!p) return null;
  if (p.videoId) return 'https://www.youtube.com/watch?v=' + p.videoId;
  if (p.channelId) return 'https://www.youtube.com/channel/' + p.channelId + '/live';
  return 'https://www.youtube.com/@' + p.handle + '/live';
}

/** Player URL, or null when the link cannot be embedded (a YouTube @handle). */
export function embedUrl(kind, value) {
  if (kind === 'twitch') {
    const ch = parseTwitch(value);
    if (!ch) return null;
    const parent = typeof window !== 'undefined' ? window.location.hostname : 'ehubapp.com';
    return `https://player.twitch.tv/?channel=${encodeURIComponent(ch)}&parent=${encodeURIComponent(parent)}&muted=true&autoplay=true`;
  }
  const p = parseYouTube(value);
  if (p?.videoId) return `https://www.youtube-nocookie.com/embed/${p.videoId}?autoplay=1&mute=1&rel=0`;
  if (p?.channelId) return `https://www.youtube.com/embed/live_stream?channel=${p.channelId}&autoplay=1&mute=1`;
  return null;
}

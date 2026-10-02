/**
 * Turns a user-typed link into a safe http(s) URL for :href.
 * "site.com" → "https://site.com"; "javascript:…", "data:…" and other schemes → null.
 */
export function safeUrl(value) {
  const v = String(value ?? '').trim();
  if (!v) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : 'https://' + v.replace(/^\/+/, '');
  try {
    const url = new URL(withScheme);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

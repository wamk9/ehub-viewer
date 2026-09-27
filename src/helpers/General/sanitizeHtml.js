import DOMPurify from 'dompurify';

/**
 * Sanitize user-authored rich text (event descriptions, articles) before v-html.
 * Keeps formatting, links, images and embedded YouTube players; strips scripts,
 * event handlers and anything else that could run code.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(String(html), {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'rel'],
  });
}

// Drop any <iframe> whose src is not a YouTube embed.
DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe') {
    const src = node.getAttribute('src') || '';
    if (!/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//.test(src)) {
      node.parentNode?.removeChild(node);
    }
  }
});

// Links opened from user content never get access to window.opener.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/** Plain-text version of rich text (share previews, counters). */
export function htmlToText(html) {
  if (!html) return '';
  const withBreaks = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|div)>/gi, '\n');
  const doc = new DOMParser().parseFromString(DOMPurify.sanitize(withBreaks), 'text/html');
  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

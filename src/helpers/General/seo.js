import Api from '@/helpers/communication/Connection.js';

// Page metadata comes from the server (same resolver that fills the HTML for
// crawlers), so in-app navigation keeps title/description/canonical in sync.
const cache = new Map();
let seq = 0;

function setMeta(attr, key, value) {
    let el = document.head.querySelector(`meta[${attr}="${key}"]`);
    if (!value) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
    }
    el.setAttribute('content', value);
}

function setCanonical(href) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!href) {
        el?.remove();
        return;
    }
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

function apply(m) {
    document.title = m.title;
    setMeta('name', 'description', m.description);
    setMeta('name', 'robots', m.robots);
    setCanonical(m.canonical);
    setMeta('property', 'og:url', m.canonical);
    setMeta('property', 'og:title', m.title);
    setMeta('property', 'og:description', m.description);
    setMeta('property', 'og:image', m.image);
    setMeta('property', 'og:type', m.type);
    setMeta('name', 'twitter:title', m.title);
    setMeta('name', 'twitter:description', m.description);
    setMeta('name', 'twitter:image', m.image);
}

export async function syncSeo(path) {
    const id = ++seq;
    let m = cache.get(path);
    if (!m) {
        const result = await Api.getAsync('/seo?path=' + encodeURIComponent(path));
        m = result.response?.message;
        if (!m) return;
        cache.set(path, m);
    }
    // A newer navigation already won.
    if (id === seq) apply(m);
}

// Pages call this after saving changes so the next visit re-reads the metadata.
export function forgetSeo() {
    cache.clear();
}

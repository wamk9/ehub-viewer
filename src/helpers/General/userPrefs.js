import Api from '@/helpers/communication/Connection';
import store from '@/store';

/**
 * Language and theme belong to the account (they follow the user across devices).
 * Guests keep them only in the browser.
 */
export function saveAccountPref(key, value) {
  if (!store.getters.getToken) return;
  Api.patchAsync('/user/profile', { [key]: value }).catch(() => {});
}

/** Applies the account's saved choices; returns true when something changed. */
export function applyAccountPrefs(profile, { setLocale, setTheme }) {
  let changed = false;
  if (profile?.locale && profile.locale !== localStorage.getItem('lang')) {
    setLocale(profile.locale);
    changed = true;
  }
  if (profile?.theme && profile.theme !== localStorage.getItem('ehub_theme')) {
    setTheme(profile.theme);
    changed = true;
  }
  return changed;
}

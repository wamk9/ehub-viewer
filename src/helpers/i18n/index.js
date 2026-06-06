import { useI18n } from 'vue-i18n'

export class i18n {
  static _i18n = null

  // Initialize the static i18n reference
  static init() {
    if (!this._i18n) {
      this._i18n = useI18n()
    }
  }

  // Translate a key
  static t(key, params = {}) {
    this.init()
    const { t, locale, availableLocales } = this._i18n

    if (!availableLocales.includes(locale.value)) {
      console.warn(`[i18n] Locale '${locale.value}' not found, falling back to 'en'.`)
      locale.value = 'en'
    }

    return t(key, params)
  }

  // Format a date
static d(value, format = 'short', timeZone = null) {
  this.init()
  const { d, locale, availableLocales } = this._i18n

  if (!availableLocales.includes(locale.value)) locale.value = 'en'

  // Ensure value is a Date
  let dateObj = value instanceof Date ? value : new Date(value)
  if (isNaN(dateObj)) {
    console.warn(`[i18n] Invalid date provided: ${value}`)
    return value
  }

  // Apply custom timezone if passed
  if (timeZone) {
    return d(dateObj, { ...this._i18n.datetimeFormats[locale.value][format], timeZone })
  }

  return d(dateObj, format)
}
  // Check if translation key exists
  static te(key) {
    this.init()
    const { te } = this._i18n
    return te(key)
  }

  // Set the locale
  static setLocale(newLocale) {
    this.init()
    const { locale, availableLocales } = this._i18n
    if (availableLocales.includes(newLocale)) {
      locale.value = newLocale
      localStorage.setItem('lang', newLocale)
    } else {
      console.warn(`[i18n] Locale '${newLocale}' not available.`)
    }
  }
}

import { createI18n } from 'vue-i18n'

// --- AUTO LOAD ALL LOCALES ---
const messages = {}
const modules = import.meta.glob('@/locales/**/*.@(json|js)', { eager: true })

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}

for (const path in modules) {
  const match = path.match(/locales\/([^\/]+)\/(.+)\.(json|js)$/)
  if (match) {
    const locale = match[1]
    const keyPath = match[2].split('/')
    let nested = modules[path].default
    for (let i = keyPath.length - 1; i >= 0; i--) {
      nested = { [keyPath[i]]: nested }
    }
    messages[locale] = deepMerge(messages[locale] || {}, nested)
  }
}

// --------------------------------

const availableLangs = Object.keys(messages)

// Get saved or browser language
const savedLang = localStorage.getItem('lang')
let browserLang = navigator.language  // ex: "pt-BR"

// Normalize browser language codes
if (browserLang === 'pt') browserLang = 'pt-BR'
if (browserLang.startsWith('es')) browserLang = 'es'

// Pick best match
const initialLocale =
  savedLang || (availableLangs.includes(browserLang) ? browserLang : 'en')

const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const i18n = createI18n({
  legacy: false, // use Composition API
  locale: initialLocale,
  fallbackLocale: 'en',
  messages,
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: browserTimezone },
      long: { year: 'numeric', month: 'long', day: '2-digit', weekday: 'long', timeZone: browserTimezone },
      dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: browserTimezone },
      timeOnly: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: browserTimezone },
      monthYear: { year: 'numeric', month: 'long', timeZone: browserTimezone },
    },
    'pt-BR': {
      short: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: browserTimezone },
      long: { year: 'numeric', month: 'long', day: '2-digit', weekday: 'long', timeZone: browserTimezone },
      dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: browserTimezone },
      timeOnly: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: browserTimezone },
      monthYear: { year: 'numeric', month: 'long', timeZone: browserTimezone },
    },
    es: {
      short: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: browserTimezone },
      long: { year: 'numeric', month: 'long', day: '2-digit', weekday: 'long', timeZone: browserTimezone },
      dateOnly: { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: browserTimezone },
      timeOnly: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: browserTimezone },
      monthYear: { year: 'numeric', month: 'long', timeZone: browserTimezone },
    },
  },
})

export default i18n
// Events created before the IANA list stored short codes; they map to a representative zone.
export const LEGACY_TZ = {
  BRT: 'America/Sao_Paulo',
  ART: 'America/Argentina/Buenos_Aires',
  CLT: 'America/Santiago',
  PET: 'America/Lima',
  EST: 'America/New_York',
  CET: 'Europe/Madrid',
};

export function normalizeTimezone(tz) {
  if (!tz) return defaultTimezone();
  return LEGACY_TZ[tz] || tz;
}

export function defaultTimezone() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'; } catch { return 'America/Sao_Paulo'; }
}

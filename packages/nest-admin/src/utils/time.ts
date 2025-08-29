export function nowISO() {
  return new Date().toISOString()
}

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

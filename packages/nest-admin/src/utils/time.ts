export function nowISO() {
  return new Date().toISOString()
}

export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function isValidDate(str: string): [boolean, Date] {
  const date = new Date(str)
  return [!isNaN(date.getTime()), date]
}

export function getShortDate(value: any) {
  const [isDate, date] = isValidDate(value)
  if (isDate) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return value
}

export function getFullDate(value: any) {
  const [isDate, date] = isValidDate(value)
  if (isDate) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  return value
}

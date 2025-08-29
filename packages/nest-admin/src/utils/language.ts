import i18n from '../i18n'

export function getLanguage() {
  return (i18n.language || window.localStorage.i18nextLng || 'en').split('-')[0]
}

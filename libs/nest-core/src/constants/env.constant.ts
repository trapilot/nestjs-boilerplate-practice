import { config } from 'dotenv'
import { join } from 'path'
import {
  EnumAppEnvironment,
  EnumAppLanguage,
  EnumAppTimezone,
  EnumCountryCode,
  EnumMessageLanguage,
} from '../enums'

export const ENV_CONFIG = ['.env', `.env.${process.env.APP_ENV}`]
const IntlDatetime = Intl.DateTimeFormat().resolvedOptions()
config({
  path: ENV_CONFIG,
  override: process.env.APP_ENV === EnumAppEnvironment.DEVELOPMENT,
})

export const ROOT_PATH = process.env.ROOT_PATH ?? process.cwd()
export const APP_PATH = process.env.APP_PATH ?? join(ROOT_PATH, 'src')

export const APP_ENV = process.env.APP_ENV || EnumAppEnvironment.DEVELOPMENT
export const APP_URL = process.env.APP_URL || ''
export const APP_NAME = process.env.APP_NAME || ''
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? IntlDatetime.timeZone
export const APP_LANGUAGE = process.env.APP_LANGUAGE ?? EnumAppLanguage.EN

export const MULTITENANT_ENABLE = process.env.MULTITENANT_ENABLE === 'true'

export const MESSAGE_FALLBACK = process.env.MESSAGE_FALLBACK ?? EnumMessageLanguage.EN
export const MESSAGE_LANGUAGES = [EnumMessageLanguage.EN, EnumMessageLanguage.VI]

export const TIMEZONE_LIST = [EnumAppTimezone.UTC, EnumAppTimezone.ASIA_HO_CHI_MINH]
export const COUNTRY_LIST = Object.values(EnumCountryCode)

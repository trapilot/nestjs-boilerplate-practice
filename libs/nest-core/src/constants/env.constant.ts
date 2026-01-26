import { config } from 'dotenv'
import { join } from 'path'
import { EnumAppEnvironment, EnumAppLanguage, EnumAppTimezone, EnumCountryCode } from '../enums'
import { DateUtil, EnumUtil, StrUtil } from '../utils'

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
export const APP_TENANT = process.env.APP_TENANT === 'true'
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? IntlDatetime.timeZone
export const APP_LANGUAGE = StrUtil.safeEnum<EnumAppLanguage>(process.env.APP_LANGUAGE, {
  enum: EnumAppLanguage,
  fallback: EnumAppLanguage.EN,
})

export const APP_START = DateUtil.asDate(process.env.APP_START, {
  startOfDay: true,
  timezone: APP_TIMEZONE,
})

export const APP_LANGUAGE_FALLBACK = process.env.APP_LANGUAGE_FALLBACK ?? APP_LANGUAGE
export const APP_LANGUAGE_LIST = StrUtil.split(
  process.env.APP_LANGUAGE_LIST || EnumUtil.enumToString(EnumAppLanguage, ','),
  {
    delimiter: ',',
    allowEmpty: false,
  },
) as EnumAppLanguage[]

export const APP_TIMEZONE_LIST = StrUtil.split(
  process.env.APP_TIMEZONE_LIST || EnumUtil.enumToString(EnumAppTimezone, ','),
  {
    delimiter: ',',
    allowEmpty: false,
  },
) as EnumAppTimezone[]

export const APP_COUNTRY_LIST = StrUtil.split(
  process.env.APP_COUNTRY_LIST || EnumUtil.enumToString(EnumCountryCode, ','),
  {
    delimiter: ',',
    allowEmpty: false,
  },
) as EnumCountryCode[]

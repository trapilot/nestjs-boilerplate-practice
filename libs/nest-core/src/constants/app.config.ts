import { ContextIdFactory } from '@nestjs/core'
import { config } from 'dotenv'
import { join } from 'path'
import {
  ENUM_APP_ENVIRONMENT,
  ENUM_APP_LANGUAGE,
  ENUM_APP_TIMEZONE,
  ENUM_COUNTRY_CODE,
  ENUM_MESSAGE_LANGUAGE,
} from '../enums'
import { AggregateByTenantContextIdStrategy } from '../strategies'

const IntlDatetime = Intl.DateTimeFormat().resolvedOptions()
config({
  path: '.env',
  override: process.env.APP_ENV === ENUM_APP_ENVIRONMENT.DEVELOPMENT,
})

export const NEST_APP = 'Nest-App'
export const NEST_CLI = 'Nest-Cli'
export const NEST_JOB = 'Nest-Job'
export const NEST_WSS = 'Nest-Wss'

export const ROOT_PATH = process.env.ROOT_PATH ?? process.cwd()
export const APP_PATH = process.env.APP_PATH ?? join(ROOT_PATH, 'src')

export const APP_ENV = process.env.APP_ENV || ENUM_APP_ENVIRONMENT.DEVELOPMENT
export const APP_URL = process.env.APP_URL || ''
export const APP_NAME = process.env.APP_NAME || ''
export const APP_TIMEZONE = process.env.APP_TIMEZONE ?? IntlDatetime.timeZone
export const APP_LANGUAGE = process.env.APP_LANGUAGE ?? ENUM_APP_LANGUAGE.EN
export const APP_VERSION_PREFIX = 'v'
export const APP_VERSION_NUMBER = '1'

export const MESSAGE_FALLBACK = process.env.MESSAGE_FALLBACK ?? ENUM_MESSAGE_LANGUAGE.EN
export const MESSAGE_LANGUAGES = [ENUM_MESSAGE_LANGUAGE.EN, ENUM_MESSAGE_LANGUAGE.VI]

export const TIMEZONE_LIST = [ENUM_APP_TIMEZONE.UTC, ENUM_APP_TIMEZONE.ASIA_HO_CHI_MINH]
export const COUNTRY_LIST = Object.values(ENUM_COUNTRY_CODE)

/**
 * Alright so with this strategy in place, you can register it
 * somewhere in your code (as it applies globally anyway)
 */
export const MULTITENANCY_ENABLE = process.env.MULTITENANCY_ENABLE === 'true'
if (MULTITENANCY_ENABLE) {
  ContextIdFactory.apply(new AggregateByTenantContextIdStrategy())
}

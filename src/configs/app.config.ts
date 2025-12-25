import { registerAs } from '@nestjs/config'
import {
  APP_LANGUAGE,
  APP_TIMEZONE,
  APP_VERSION_NUMBER,
  APP_VERSION_PREFIX,
  COUNTRY_LIST,
} from 'lib/nest-core'

export default registerAs(
  'app',
  (): Record<string, any> => ({
    env: process.env.APP_ENV,
    url: process.env.APP_URL,
    web: process.env.WEB_URL,
    name: process.env.APP_NAME,
    version: '0.0.1',
    timezone: APP_TIMEZONE,
    language: APP_LANGUAGE,
    globalPrefix: '/api',
    startDate: '2025-01-01T00:00:00Z',

    country: {
      availableList: COUNTRY_LIST,
    },

    membership: {
      expiresIn: 1, // years
      codeDigits: 8, // chars
      firstTransaction: 30, // days
    },

    debug: {
      level: process.env.DEBUG_LEVEL || 'error',
      driver: process.env.DEBUG_DRIVER || 'file', // file | remote
      remote: {
        url: process.env.DEBUG_REMOTE,
      },
    },

    urlVersion: {
      prefix: APP_VERSION_PREFIX,
      version: APP_VERSION_NUMBER,
    },

    http: {
      host: process.env.HTTP_HOST ?? 'localhost',
      port: Number.parseInt(process.env.HTTP_PORT ?? '3000'),
    },

    wssEnable: process.env.WSS_ENABLE === 'true',
    jobEnable: process.env.JOB_ENABLE === 'true',
  }),
)

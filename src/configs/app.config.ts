import { registerAs } from '@nestjs/config'
import { APP_LANGUAGE, APP_TIMEZONE, StrUtil } from 'lib/nest-core'
import { ENUM_LOGGER_TYPE } from 'lib/nest-logger'

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
    startDate: '2025-01-01T00:00:00Z',

    debug: {
      level: process.env.DEBUG_LEVEL || 'error',
      driver: process.env.DEBUG_DRIVER || 'file', // file | remote
      remote: {
        url: process.env.DEBUG_REMOTE,
      },
      file: {
        default: {
          maxDays: 90,
          maxSize: 500 * 1024 * 1024,
        },
        [ENUM_LOGGER_TYPE.DATABASE]: {
          maxDays: 2,
          maxSize: 500 * 1024 * 1024,
        },
      },
    },

    urlVersion: {
      prefix: 'v',
      version: '1',
    },

    http: {
      host: process.env.HTTP_HOST ?? 'localhost',
      port: StrUtil.numeric(process.env.HTTP_PORT, 3000),
      prefix: process.env.HTTP_PREFIX ?? 'api',
    },

    wssEnable: StrUtil.isTrue(process.env.WSS_ENABLE),
    jobEnable: StrUtil.isTrue(process.env.JOB_ENABLE),
  }),
)

import { registerAs } from '@nestjs/config'
import { APP_LANGUAGE, APP_TIMEZONE, DateUtil, IConfigApp, StrUtil } from 'lib/nest-core'

export default registerAs(
  'app',
  (): IConfigApp => ({
    env: process.env.APP_ENV,
    url: process.env.APP_URL,
    web: process.env.WEB_URL,
    name: process.env.APP_NAME,
    version: '0.0.1',
    timezone: APP_TIMEZONE,
    language: APP_LANGUAGE,
    startDate: DateUtil.getDate('01/01/2025'),

    urlVersion: {
      prefix: 'v',
      version: '1',
    },

    http: {
      host: process.env.HTTP_HOST ?? 'localhost',
      port: StrUtil.numeric(process.env.HTTP_PORT, 3000),
      prefix: process.env.HTTP_PREFIX ?? 'api',
      compress: StrUtil.isTrue(process.env.HTTP_COMPRESS, true),
    },

    wssEnable: StrUtil.isTrue(process.env.WSS_ENABLE),
    jobEnable: StrUtil.isTrue(process.env.JOB_ENABLE),
  }),
)

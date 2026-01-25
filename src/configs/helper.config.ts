import { registerAs } from '@nestjs/config'
import { AppUtil, IConfigHelper, MESSAGE_FALLBACK, MESSAGE_LANGUAGES, StrUtil } from 'lib/nest-core'

export default registerAs(
  'helper',
  (): IConfigHelper => ({
    salt: {
      length: 8,
    },
    jwt: {
      defaultSecretKey: process.env.APP_SECRET_KEY ?? 'APP=8CdW7PdmXqYqRe5E/Q==',
      defaultExpirationTime: AppUtil.ms('1h'),
      notBeforeExpirationTime: 0,
    },
    http: {
      maxRedirects: 5,
      timeout: 5_000,
    },
    message: {
      fallback: MESSAGE_FALLBACK,
      availableList: MESSAGE_LANGUAGES,
    },
    mailer: {
      dryRun: StrUtil.isTrue(process.env.EMAIL_DRYRUN),
      defaultTransport: 'smtp',
      transports: {
        smtp: {
          url: process.env.SMTP_URL,
          from: process.env?.SMTP_FROM,
        },
        ses: {
          url: process.env.SES_URL,
          from: process.env.SES_FROM,
        },
      },
    },
  }),
)

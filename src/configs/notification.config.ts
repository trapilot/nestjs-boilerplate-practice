import { registerAs } from '@nestjs/config'
import { StrUtil } from 'lib/nest-core'

export default registerAs(
  'notification',
  (): Record<string, any> => ({
    sms: {
      dryRun: StrUtil.isTrue(process.env.SMS_DRYRUN),
      retries: 1,
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
    },
    email: {
      dryRun: StrUtil.isTrue(process.env.EMAIL_DRYRUN),
      retries: 1,
      transport: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    },
    push: {
      dryRun: StrUtil.isTrue(process.env.PUSH_DRYRUN),
      retries: 1,
      firebase: {
        serviceAccountPath: process.env.FIREBASE_ACCOUNT_PATH,
      },
    },
  }),
)

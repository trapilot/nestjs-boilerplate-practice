import { registerAs } from '@nestjs/config'
import { IConfigNotification, StrUtil } from 'lib/nest-core'

export default registerAs(
  'notification',
  (): IConfigNotification => ({
    sms: {
      dryRun: StrUtil.isTrue(process.env.SMS_DRYRUN),
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
    },
    email: {
      dryRun: StrUtil.isTrue(process.env.EMAIL_DRYRUN),
      transport: process.env.EMAIL_URL,
      noReply: process.env.EMAIL_USER,
    },
    push: {
      dryRun: StrUtil.isTrue(process.env.PUSH_DRYRUN),
      firebase: {
        serviceAccountPath: process.env.FIREBASE_ACCOUNT_PATH,
      },
    },
  })
)

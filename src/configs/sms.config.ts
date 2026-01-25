import { registerAs } from '@nestjs/config'
import { IConfigSms, StrUtil } from 'lib/nest-core'

export default registerAs(
  'sms',
  (): IConfigSms => ({
    dryRun: StrUtil.isTrue(process.env.SMS_DRYRUN),
    drivers: {
      twilio: {
        sender: process.env.TWILIO_SENDER,
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
    },
  }),
)

import { registerAs } from '@nestjs/config'

export default registerAs(
  'notification',
  (): Record<string, any> => ({
    sms: {
      dryRun: process.env.SMS_DRYRUN === 'true',
      retries: 1,
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
      },
    },
    email: {
      dryRun: process.env.EMAIL_DRYRUN === 'true',
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
      dryRun: process.env.PUSH_DRYRUN === 'true',
      retries: 1,
      firebase: {
        serviceAccountPath: process.env.FIREBASE_ACCOUNT_PATH,
      },
    },
  }),
)

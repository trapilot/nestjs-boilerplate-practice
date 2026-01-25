import { registerAs } from '@nestjs/config'
import { IConfigPush, StrUtil } from 'lib/nest-core'

export default registerAs(
  'push',
  (): IConfigPush => ({
    dryRun: StrUtil.isTrue(process.env.PUSH_DRYRUN),
    drivers: {
      firebase: {
        serviceAccountPath: process.env.FIREBASE_ACCOUNT_PATH,
      },
      onesignal: {
        appId: '111',
        parameters: {
          organizationApiKey: 'string',
          restApiKey: 'string',
        },
      },
    },
  }),
)

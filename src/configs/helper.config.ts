import { registerAs } from '@nestjs/config'
import { MESSAGE_FALLBACK, MESSAGE_LANGUAGES } from 'lib/nest-core'

export default registerAs(
  'helper',
  (): Record<string, any> => ({
    salt: {
      length: 8,
    },
    jwt: {
      defaultSecretKey: process.env.APP_SECRET_KEY ?? 'APP=8CdW7PdmXqYqRe5E/Q==',
      defaultExpirationTime: '1h',
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
  }),
)

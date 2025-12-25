import { registerAs } from '@nestjs/config'
import { TimeUtil } from 'lib/nest-core'

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    jwt: {
      accessToken: {
        secretKey: process.env.AUTH_JWT_ACCESS_TOKEN_SECRET_KEY ?? `${process.env.APP_NAME}_as_k`,
        expirationTime: TimeUtil.seconds(process.env.AUTH_JWT_ACCESS_TOKEN_EXPIRED || '30m'),
      },

      refreshToken: {
        secretKey: process.env.AUTH_JWT_REFRESH_TOKEN_SECRET_KEY ?? `${process.env.APP_NAME}_rs_k`,
        expirationTime: TimeUtil.seconds(process.env.AUTH_JWT_REFRESH_TOKEN_EXPIRED || '2h'),
      },

      audience: process.env.AUTH_JWT_AUDIENCE ?? process.env.APP_NAME,
      issuer: process.env.AUTH_JWT_ISSUER ?? process.env.APP_NAME,
      header: 'Authorization',
      prefix: 'Bearer',
    },

    password: {
      attempt: true,
      maxAttempt: 5,
      saltLength: 8,
      expiredIn: TimeUtil.seconds('182d'), // 0.5 years
      expiredInTemporary: TimeUtil.seconds('3d'), // 3 days
      period: TimeUtil.seconds('90d'), // 3 months
    },

    apple: {
      header: 'Authorization',
      prefix: 'Bearer',
      clientId: process.env.AUTH_SOCIAL_APPLE_CLIENT_ID,
      signInClientId: process.env.AUTH_SOCIAL_APPLE_SIGN_IN_CLIENT_ID,
    },

    google: {
      header: 'Authorization',
      prefix: 'Bearer',
      clientId: process.env.AUTH_SOCIAL_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_SOCIAL_GOOGLE_CLIENT_SECRET,
    },

    xApiKey: { header: 'x-api-key' },

    otp: { length: 6, maxAttempts: 5, ttl: TimeUtil.seconds('5m') },
    token: { length: 32, maxAttempts: 3, ttl: TimeUtil.seconds('1d') },
  }),
)

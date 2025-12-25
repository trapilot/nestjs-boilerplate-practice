import { registerAs } from '@nestjs/config'
import bytes from 'bytes'
import { EnvUtil, TimeUtil } from 'lib/nest-core'

export default registerAs(
  'middleware',
  (): Record<string, any> => ({
    body: {
      json: {
        limit: bytes('10mb'), // 10mb
      },
      raw: {
        limit: bytes('10mb'), // 10mb
      },
      text: {
        limit: bytes('10mb'), // 10mb
      },
      urlencoded: {
        extended: false,
        limit: bytes('10mb'), // 10mb
      },
    },
    cors: {
      allowMethod: ['GET', 'DELETE', 'PUT', 'PATCH', 'POST', 'HEAD'],
      allowOrigin: process.env.MIDDLEWARE_CORS_ORIGIN?.split(',') ?? '*',
      exposeHeader: ['Content-Disposition', 'Content-Language', 'Content-Type'],
      allowHeader: [
        'Accept',
        'Accept-Language',
        'Content-Language',
        'Content-Type',
        'Origin',
        'Authorization',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials',
        'Access-Control-Expose-Headers',
        'Access-Control-Max-Age',
        'Referer',
        'Host',
        'X-Requested-With',
        'X-Response-Time',
        'user-agent',
        'x-api-key',
        'x-user-otp',
        'x-user-ott',
        'x-user-hmac',
        'x-user-agent',
        'x-user-token',
        'x-user-gender',
        'x-request-id',
        'x-timezone',
        'x-language',
        'x-version',
        'x-timestamp',
        'x-nonce',
        'x-signature',
        'x-body-hash',
        'x-repo-version',
        'x-cart-version',
      ],
    },
    timeout: TimeUtil.ms('10s'), // 10s based on ms module
    security: {
      key: process.env.MIDDLEWARE_SECURITY_KEY ?? 'SECURITY=PdmXqYqRe5E/Q==',
      ttl: 300, // 5 minutes
      enable: !EnvUtil.isDevelopment(),
    },
    throttle: {
      ttl: TimeUtil.ms('500'), // 0.5 secs
      limit: 5, // max request per reset time
    },
  }),
)

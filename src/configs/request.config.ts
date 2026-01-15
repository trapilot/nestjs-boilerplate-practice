import { registerAs } from '@nestjs/config'
import { FileUtil, IConfigRequest, TimeUtil } from 'lib/nest-core'

export default registerAs(
  'request',
  (): IConfigRequest => ({
    body: {
      json: {
        limitInBytes: FileUtil.kilobytes(500),
      },
      text: {
        limitInBytes: FileUtil.megabytes(1),
      },
      urlencoded: {
        limitInBytes: FileUtil.megabytes(1),
      },
      applicationOctetStream: {
        limitInBytes: FileUtil.megabytes(10),
      },
    },
    cors: {
      allowedOrigin: process.env.CORS_ALLOWED_ORIGIN?.split(',') ?? '*',
      allowedMethods: ['GET', 'DELETE', 'PUT', 'PATCH', 'POST', 'HEAD'],
      exposedHeaders: ['Content-Disposition', 'Content-Language', 'Content-Type'],
      allowedHeaders: [
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
        'x-user-type',
        'x-user-hmac',
        'x-user-agent',
        'x-user-token',
        'x-request-id',
        'x-correlation-id',
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
    cachePrefix: 'API_CACHE',
    timeoutInMs: TimeUtil.ms('10s'), // 10s based on ms module
    security: {
      enable: false,
      key: process.env.MIDDLEWARE_SECURITY_KEY ?? 'SECURITY=PdmXqYqRe5E/Q==',
      ttl: TimeUtil.ms(300), // 5 minutes
    },
    throttle: {
      ttl: TimeUtil.ms(500), // 0.5 secs
      limit: 5, // max request per reset time
    },
  })
)

import { registerAs } from '@nestjs/config'
import { StrUtil } from 'lib/nest-core'

export default registerAs(
  'redis',
  (): Record<string, any> => ({
    cache: {
      host: process.env.REDIS_HOST,
      port: StrUtil.numeric(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      database: 0,
      ttl: 5 * 1000, // 5 mins
      max: 10,
    },
    queue: {
      host: process.env.REDIS_HOST,
      port: StrUtil.numeric(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      database: 1,
    },
    pubsub: {
      host: process.env.REDIS_HOST,
      port: StrUtil.numeric(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      database: 2,
    },
    realtime: {
      host: process.env.REDIS_HOST,
      port: StrUtil.numeric(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      database: 3,
    },
    stream: {
      host: process.env.REDIS_HOST,
      port: StrUtil.numeric(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      username: process.env.REDIS_USERNAME,
      database: 4,
    },
  }),
)

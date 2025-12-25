import { registerAs } from '@nestjs/config'
import { ENUM_LOGGER_TYPE } from 'lib/nest-logger'

export default registerAs(
  'database',
  (): Record<string, any> => ({
    debug: process.env.DATABASE_DEBUG === 'true',
    context: ENUM_LOGGER_TYPE.MYSQL,
    replication: {
      master: process.env.DATABASE_URL,
      slaves: process.env.REPLICA_URL?.split(',') ?? [],
    },
  }),
)

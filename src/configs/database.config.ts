import { registerAs } from '@nestjs/config'
import { StrUtil } from 'lib/nest-core'
import { ENUM_LOGGER_TYPE } from 'lib/nest-logger'

export default registerAs(
  'database',
  (): Record<string, any> => ({
    debug: process.env.DATABASE_DEBUG === 'true',
    context: ENUM_LOGGER_TYPE.MYSQL,
    replication: {
      master: process.env.DATABASE_URL,
      slaves: StrUtil.split(process.env.REPLICA_URL, { delimiter: ',', allowEmpty: false }),
    },
  }),
)

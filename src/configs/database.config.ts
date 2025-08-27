import { registerAs } from '@nestjs/config'

export default registerAs(
  'database',
  (): Record<string, any> => ({
    debug: process.env.DATABASE_DEBUG === 'true',
    lazy: process.env.DATABASE_LAZY === 'true',
    url: process.env.DATABASE_URL,
  }),
)

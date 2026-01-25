import { registerAs } from '@nestjs/config'
import { IConfigLogger } from 'lib/nest-core'

export default registerAs(
  'logger',
  (): IConfigLogger => ({
    level: process.env.LOGGER_LEVEL || 'info',
    driver: process.env.LOGGER_DRIVER || 'file', // file | remote

    remote: {
      url: process.env.LOGGER_REMOTE,
    },

    file: {
      default: {
        maxDays: 1,
        maxSize: 500 * 1024 * 1024,
      },
      http: {
        maxDays: 30,
        maxSize: 500 * 1024 * 1024,
      },
      system: {
        maxDays: 7,
        maxSize: 500 * 1024 * 1024,
      },
    },
  }),
)

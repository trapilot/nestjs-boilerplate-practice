import { registerAs } from '@nestjs/config'
import { COUNTRY_LIST } from 'lib/nest-core'

export default registerAs(
  'module',
  (): Record<string, Record<string, number | string | string[]>> => ({
    country: {
      availableList: COUNTRY_LIST,
    },

    member: {
      expiresIn: 1, // years
      codeDigits: 8, // chars
      firstTransaction: 30, // days
    },
  })
)

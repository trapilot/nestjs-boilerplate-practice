import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { ENUM_SETTING_TYPE } from '../enums'

export class SettingResponseDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ description: 'Name of setting', example: 'MaintenanceOn' })
  @Type(() => String)
  @Expose()
  name: string

  @ApiProperty({ description: 'Code of setting', example: 'MaintenanceOn' })
  @Type(() => String)
  @Expose()
  code: string

  @ApiProperty({ description: 'Description of setting', example: 'Maintenance Mode' })
  @Type(() => String)
  @Expose()
  description?: string

  @ApiProperty({
    description: 'Data type of setting',
    example: ENUM_SETTING_TYPE.BOOLEAN,
    enum: ENUM_SETTING_TYPE,
  })
  @Type(() => String)
  @Expose()
  type: ENUM_SETTING_TYPE

  @ApiProperty({
    description: 'Value of string, can be type string/boolean/number',
    oneOf: [
      { type: ENUM_SETTING_TYPE.STRING, readOnly: true, examples: ['on', 'off'] },
      { type: ENUM_SETTING_TYPE.NUMBER, readOnly: true, examples: [100, 200] },
      { type: ENUM_SETTING_TYPE.BOOLEAN, readOnly: true, examples: [true, false] },
    ],
  })
  @Transform(({ value, obj }) => {
    const regex = /^-?\d+$/
    const checkNum = regex.test(value)

    if (obj.type === ENUM_SETTING_TYPE.BOOLEAN && (value === 'true' || value === 'false')) {
      return value === 'true' ? true : false
    }

    if (obj.type === ENUM_SETTING_TYPE.YESNO && (value === 'yes' || value === 'no')) {
      return value === 'yes' ? true : false
    }

    if (obj.type === ENUM_SETTING_TYPE.ONOFF && (value === 'on' || value === 'off')) {
      return value === 'on' ? true : false
    }

    if (obj.type === ENUM_SETTING_TYPE.NUMBER && checkNum) {
      return Number(value)
    }

    if (obj.type === ENUM_SETTING_TYPE.ARRAY_OF_STRING) {
      return value.split(',')
    }

    if (obj.type === ENUM_SETTING_TYPE.ARRAY_OF_NUMBER) {
      return value.split(',').map((v: string) => Number(v))
    }

    return value
  })
  @Expose()
  value: string | number | boolean

  @Type(() => String)
  @Expose()
  refer: string

  @ApiProperty({ description: 'Date created at', example: faker.date.past() })
  @Type(() => Date)
  @Expose()
  createdAt: Date

  @ApiProperty({ description: 'Date updated at', example: faker.date.recent() })
  @Type(() => Date)
  @Expose()
  updatedAt: Date
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { EnumSettingType } from '../enums'

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
    example: EnumSettingType.BOOLEAN,
    enum: EnumSettingType,
  })
  @Type(() => String)
  @Expose()
  type: EnumSettingType

  @ApiProperty({
    description: 'Value of string, can be type string/boolean/number',
    oneOf: [
      { type: EnumSettingType.STRING, readOnly: true, examples: ['on', 'off'] },
      { type: EnumSettingType.NUMBER, readOnly: true, examples: [100, 200] },
      { type: EnumSettingType.BOOLEAN, readOnly: true, examples: [true, false] },
    ],
  })
  @Transform(({ value, obj }) => {
    const regex = /^-?\d+$/
    const checkNum = regex.test(value)

    if (obj.type === EnumSettingType.BOOLEAN && (value === 'true' || value === 'false')) {
      return value === 'true' ? true : false
    }

    if (obj.type === EnumSettingType.YESNO && (value === 'yes' || value === 'no')) {
      return value === 'yes' ? true : false
    }

    if (obj.type === EnumSettingType.ONOFF && (value === 'on' || value === 'off')) {
      return value === 'on' ? true : false
    }

    if (obj.type === EnumSettingType.NUMBER && checkNum) {
      return Number(value)
    }

    if (obj.type === EnumSettingType.ARRAY_OF_STRING) {
      return value.split(',')
    }

    if (obj.type === EnumSettingType.ARRAY_OF_NUMBER) {
      return value.split(',').map((v: string) => Number(v))
    }

    return value
  })
  @Expose()
  value: string | number | boolean

  @Type(() => String)
  @Expose()
  refer: string

  @ApiProperty({ description: 'Date created at', example: new Date(Date.now() - 30000 * 3600) })
  @Type(() => Date)
  @Expose()
  createdAt: Date

  @ApiProperty({ description: 'Date updated at', example: new Date(Date.now() - 1000 * 3600) })
  @Type(() => Date)
  @Expose()
  updatedAt: Date
}

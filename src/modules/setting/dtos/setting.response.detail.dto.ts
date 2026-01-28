import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { EnumSettingType } from '../enums'
import { SettingUtil } from '../helpers'

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
    enumName: 'EnumSettingType',
  })
  @Type(() => String)
  @Expose()
  type: EnumSettingType

  @ApiProperty({
    description: 'Value of string, can be type string/boolean/number',
  })
  @Transform(({ value, obj }) => SettingUtil.parseCache(value, obj.type))
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

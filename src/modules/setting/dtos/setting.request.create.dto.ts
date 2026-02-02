import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { SafeString } from 'lib/nest-web'
import { EnumSettingGroup, EnumSettingType } from '../enums/setting.enum'

export class SettingRequestCreateDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @SafeString()
  @ApiProperty({ required: true, example: '' })
  code: string

  @IsNotEmpty()
  @IsString()
  @ToString()
  @SafeString()
  @ApiProperty({ required: true, example: '' })
  name: string

  @IsOptional()
  @IsEnum(EnumSettingGroup)
  @ToString()
  @ApiProperty({
    required: true,
    example: EnumSettingGroup.SYSTEM,
    enum: EnumSettingGroup,
    enumName: 'EnumSettingGroup',
  })
  group: EnumSettingGroup

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({
    required: false,
    examples: ['Maintenance Mode', 'Max Part Number Chunk File'],
  })
  description?: string

  @IsNotEmpty()
  @IsEnum(EnumSettingType)
  @ToString()
  @ApiProperty({
    required: true,
    example: EnumSettingType.BOOLEAN,
    enum: EnumSettingType,
    enumName: 'EnumSettingType',
  })
  type: EnumSettingType

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    name: 'value',
    description: 'The value of setting',
    nullable: false,
    oneOf: [
      { type: 'string', readOnly: true, examples: ['on', 'off'] },
      { type: 'number', readOnly: true, examples: ['100', '200'] },
      { type: 'boolean', readOnly: true, examples: ['true', 'false'] },
    ],
  })
  value: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({
    description: 'The refer of setting',
    nullable: true,
  })
  refer: string
}

import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { SafeString } from 'lib/nest-web'
import { ENUM_SETTING_TYPE } from '../enums'

export class SettingRequestCreateDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @SafeString()
  @ApiProperty({ required: true, example: '' })
  name: string

  @IsOptional()
  @IsString()
  @ToString()
  @SafeString()
  @ApiProperty({ required: true, example: '' })
  group: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({
    required: false,
    examples: ['Maintenance Mode', 'Max Part Number Chunk File'],
  })
  description?: string

  @IsNotEmpty()
  @IsEnum(ENUM_SETTING_TYPE)
  @ToString()
  @ApiProperty({ required: true, example: 'BOOLEAN', enum: ENUM_SETTING_TYPE })
  type: ENUM_SETTING_TYPE

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

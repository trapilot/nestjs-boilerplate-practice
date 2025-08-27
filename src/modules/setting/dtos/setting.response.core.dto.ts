import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ENUM_MESSAGE_LANGUAGE } from 'lib/nest-core'
import { SettingFileResponseDto } from './setting.response.file.dto'
import { SettingTimezoneResponseDto } from './setting.response.timezone.dto'

export class SettingCoreResponseDto {
  @ApiProperty({
    required: true,
    nullable: false,
    enum: ENUM_MESSAGE_LANGUAGE,
    type: 'array',
    isArray: true,
  })
  @Expose()
  languages: ENUM_MESSAGE_LANGUAGE[]

  @ApiProperty({
    required: true,
    type: () => SettingFileResponseDto,
    oneOf: [{ $ref: getSchemaPath(SettingFileResponseDto) }],
  })
  @Type(() => SettingFileResponseDto)
  @Expose()
  file: SettingFileResponseDto

  @ApiProperty({
    required: true,
    type: () => SettingTimezoneResponseDto,
    oneOf: [{ $ref: getSchemaPath(SettingTimezoneResponseDto) }],
  })
  @Type(() => SettingTimezoneResponseDto)
  @Expose()
  timezone: SettingTimezoneResponseDto

  @ApiProperty({
    required: true,
  })
  @Type(() => String)
  @Expose()
  token: string
}

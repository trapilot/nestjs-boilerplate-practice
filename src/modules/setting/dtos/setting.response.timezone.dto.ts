import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SettingTimezoneResponseDto {
  @ApiProperty({ required: true })
  @Expose()
  timezone: string

  @ApiProperty({ required: true })
  @Expose()
  timezoneOffset: string
}

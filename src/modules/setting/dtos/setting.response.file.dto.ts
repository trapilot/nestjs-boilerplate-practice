import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class SettingFileResponseDto {
  @ApiProperty({ required: true })
  @Expose()
  sizeInBytes: number
}

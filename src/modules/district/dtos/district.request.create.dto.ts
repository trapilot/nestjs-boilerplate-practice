import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsObject } from 'class-validator'
import { ToBoolean, ToNumber, ToObject } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class DistrictRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: 1 })
  countryId: number

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  name: object

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ example: true, required: true })
  isActive: boolean
}

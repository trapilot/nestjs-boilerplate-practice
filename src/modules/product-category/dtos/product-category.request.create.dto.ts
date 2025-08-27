import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsObject } from 'class-validator'
import { ToBoolean, ToObject } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class ProductCategoryRequestCreateDto {
  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ required: true, type: RequestSentenceDto })
  name: any

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: false })
  isActive: boolean
}

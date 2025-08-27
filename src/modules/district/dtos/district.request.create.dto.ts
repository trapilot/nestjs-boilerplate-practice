import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsObject } from 'class-validator'
import { ToBoolean, ToNumber, ToObject } from 'lib/nest-core'
import { RequestSentenceDto } from 'lib/nest-web'

export class DistrictRequestCreateDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ example: faker.number.int({ min: 1, max: 3 }) })
  countryId: number

  @IsNotEmpty()
  @IsObject()
  @ToObject({ type: RequestSentenceDto })
  @ApiProperty({ type: RequestSentenceDto })
  name: any

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ example: true, required: true })
  isActive: boolean
}

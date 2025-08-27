import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, Min } from 'class-validator'
import { ToNumber } from 'lib/nest-core'

export class MemberAddPointRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @Min(1)
  @ApiProperty({ required: true, example: 1 })
  point: number
}

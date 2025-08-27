import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { ToPhone, ToString } from 'lib/nest-core'
import { IsPhone } from 'lib/nest-web'

export class CartRequestCheckoutDto {
  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: '' })
  address: string

  @IsOptional()
  @IsPhone()
  @ToPhone()
  @ApiProperty({ required: true, example: '' })
  phone: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: '' })
  note: string
}

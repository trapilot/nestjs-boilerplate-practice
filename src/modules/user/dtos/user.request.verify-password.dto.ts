import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'

export class UserVerifyPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_USER_PASS })
  password: string
}

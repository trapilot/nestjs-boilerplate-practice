import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { IsEmail, IsPhone } from 'lib/nest-web'

export class MemberRequestOTPDto {
  @IsNotEmpty()
  @IsPhone()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PHONE })
  phone: string
}

export class MemberRequestTokenDto {
  @IsNotEmpty()
  @IsEmail()
  @ToString()
  @ApiProperty({ required: false, example: process.env.MOCK_MEMBER_EMAIL })
  email: string
}

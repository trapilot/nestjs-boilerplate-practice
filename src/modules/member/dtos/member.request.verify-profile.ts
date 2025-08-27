import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { IsCustomEmail, IsPhone } from 'lib/nest-web'

export class MemberRequestOTPDto {
  @IsNotEmpty()
  @IsPhone()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PHONE })
  phone: string
}

export class MemberRequestTokenDto {
  @IsNotEmpty()
  @IsCustomEmail()
  @ToString()
  @ApiProperty({ required: false, example: process.env.MOCK_MEMBER_EMAIL })
  email: string
}

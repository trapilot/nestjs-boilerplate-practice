import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, MaxLength } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { IsPassword } from 'lib/nest-web'
import { MemberRequestOTPDto } from './member.request.verify-profile'

export class MemberResetPasswordRequestDto extends MemberRequestOTPDto {
  @IsNotEmpty()
  @IsPassword()
  @ToString()
  @MaxLength(50)
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PASS })
  password: string
}

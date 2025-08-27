import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { IsPassword } from 'lib/nest-web'

export class MemberChangePasswordRequestDto {
  @IsNotEmpty()
  @IsPassword()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PASS })
  newPassword: string

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PASS })
  oldPassword: string
}

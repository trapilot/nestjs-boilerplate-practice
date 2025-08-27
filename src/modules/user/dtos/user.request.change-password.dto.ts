import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { IsPassword } from 'lib/nest-web'

export class UserRequestChangePasswordDto {
  @IsNotEmpty()
  @IsPassword()
  @ToString()
  @ApiProperty({
    required: true,
    description: "new string password, newPassword can't same with oldPassword",
    example: process.env.MOCK_USER_PASS,
  })
  newPassword: string

  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({
    required: true,
    description: 'old string password',
    example: process.env.MOCK_USER_PASS,
  })
  oldPassword: string
}

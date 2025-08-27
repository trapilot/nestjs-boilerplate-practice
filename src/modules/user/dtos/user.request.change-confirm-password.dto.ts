import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { ToString } from 'lib/nest-core'

export class UserRequestChangeConfirmPasswordDto {
  @IsNotEmpty()
  @ToString()
  @ApiProperty({
    required: true,
    description: 'new confirm password',
    example: process.env.MOCK_USER_PASS,
  })
  password: string
}

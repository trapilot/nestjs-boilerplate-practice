import { ApiProperty, PickType } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { MemberRequestSignUpDto } from './member.request.sign-up.dto'

export class MemberSignInRequestDto extends PickType(MemberRequestSignUpDto, ['phone']) {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PASS ?? '' })
  password: string
}

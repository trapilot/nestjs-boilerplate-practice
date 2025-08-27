import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'
import { ToString } from 'lib/nest-core'
import { IsPassword } from 'lib/nest-web'
import { MemberRequestCreateDto } from './member.request.create.dto'

export class MemberRequestUpdateDto extends OmitType(MemberRequestCreateDto, [
  'password',
  'avatar',
] as const) {
  @IsOptional()
  @IsPassword()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PASS })
  password: string
}

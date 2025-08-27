import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'
import { ToBoolean, ToString } from 'lib/nest-core'
import { IsPassword } from 'lib/nest-web'
import { UserRequestCreateDto } from './user.request.create.dto'

export class UserRequestUpdateDto extends OmitType(UserRequestCreateDto, ['avatar', 'password']) {
  @IsOptional()
  @IsPassword()
  @ToString()
  @ApiProperty({ required: false, example: process.env.MOCK_USER_PASS })
  password: string

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: false, example: true })
  isActive: boolean
}

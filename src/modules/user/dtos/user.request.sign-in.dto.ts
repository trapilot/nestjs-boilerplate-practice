import { ApiHideProperty, ApiProperty, PickType } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { ToBoolean, ToString } from 'lib/nest-core'
import { UserRequestCreateDto } from './user.request.create.dto'

export class UserRequestSignInDto extends PickType(UserRequestCreateDto, ['email'] as const) {
  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_USER_PASS || '' })
  password: string

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  // @ApiProperty({ required: false, example: true })
  @ApiHideProperty()
  rememberMe?: boolean
}

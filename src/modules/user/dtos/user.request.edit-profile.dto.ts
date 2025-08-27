import { OmitType } from '@nestjs/swagger'
import { UserRequestCreateDto } from './user.request.create.dto'

export class UserEditProfileRequestDto extends OmitType(UserRequestCreateDto, [
  'password',
  'avatar',
] as const) {}

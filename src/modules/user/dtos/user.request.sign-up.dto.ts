import { OmitType } from '@nestjs/swagger'
import { UserRequestCreateDto } from './user.request.create.dto'

export class UserRequestSignUpDto extends OmitType(UserRequestCreateDto, [
  'roleId',
  'isActive',
  'phone',
] as const) {}

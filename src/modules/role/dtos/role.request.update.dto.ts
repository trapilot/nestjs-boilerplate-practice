import { OmitType } from '@nestjs/swagger'
import { RoleRequestCreateDto } from './role.request.create.dto'

export class RoleRequestUpdateDto extends OmitType(RoleRequestCreateDto, ['code'] as const) {}

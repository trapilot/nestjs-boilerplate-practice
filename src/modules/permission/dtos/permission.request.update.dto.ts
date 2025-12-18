import { OmitType } from '@nestjs/swagger'
import { PermissionRequestCreateDto } from './permission.request.create.dto'

export class PermissionRequestUpdateDto extends OmitType(PermissionRequestCreateDto, [] as const) {}

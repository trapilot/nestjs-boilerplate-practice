import { OmitType } from '@nestjs/swagger'
import { MemberPointRequestCreateDto } from './member-point.request.create.dto'

export class MemberPointRequestUpdateDto extends OmitType(MemberPointRequestCreateDto, []) {}

import { OmitType } from '@nestjs/swagger'
import { PushRequestCreateDto } from './push.request.create.dto'

export class PushRequestUpdateDto extends OmitType(PushRequestCreateDto, []) {}

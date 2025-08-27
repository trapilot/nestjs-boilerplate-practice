import { OmitType } from '@nestjs/swagger'
import { MediaRequestCreateDto } from './media.request.create.dto'

export class MediaRequestUpdateDto extends OmitType(MediaRequestCreateDto, []) {}

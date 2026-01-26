import { OmitType } from '@nestjs/swagger'
import { PageRequestCreateDto } from './page.request.create.dto'

export class PageRequestUpdateDto extends OmitType(PageRequestCreateDto, ['type'] as const) {}

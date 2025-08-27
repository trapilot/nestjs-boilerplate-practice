import { OmitType } from '@nestjs/swagger'
import { InvoiceRequestCreateDto } from './invoice.request.create.dto'

export class InvoiceRequestUpdateDto extends OmitType(InvoiceRequestCreateDto, []) {}

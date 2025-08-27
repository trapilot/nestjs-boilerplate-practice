import { OmitType } from '@nestjs/swagger'
import { ApiKeyRequestCreateDto } from './api-key.request.create.dto'

export class ApiKeyRequestUpdateDto extends OmitType(ApiKeyRequestCreateDto, ['type']) {}

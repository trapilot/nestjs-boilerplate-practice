import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { API_KEY_DOC_OPERATION } from '../constants'
import { ApiKeyService } from '../services'

@ApiTags(API_KEY_DOC_OPERATION)
@Controller({ version: '1', path: '/api-keys' })
export class ApiKeyAppController {
  constructor(protected readonly apiKeyService: ApiKeyService) {}
}

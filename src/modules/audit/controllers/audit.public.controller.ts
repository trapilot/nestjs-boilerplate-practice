import { Controller, Post, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ApiRequestData, IResponseData, RequestBody } from 'lib/nest-web'
import { AUDIT_DOC_OPERATION } from '../constants/audit.doc.constant'
import { AuditRequestEntryDto } from '../dtos/audit.request.entry.dto'
import { AuditService } from '../services/audit.service'

@ApiTags(AUDIT_DOC_OPERATION)
@Controller({ version: VERSION_NEUTRAL, path: '/audit' })
export class AuditPublicController {
  constructor(protected readonly auditService: AuditService) {}

  @ApiRequestData({
    summary: AUDIT_DOC_OPERATION,
    docExclude: true,
    docExpansion: false,
    rateLimit: {
      short: { limit: 3, seconds: 1 },
      long: { limit: 100, seconds: 60 },
    },
  })
  @Post('/send-entry')
  async createEntry(@RequestBody() _body: AuditRequestEntryDto): Promise<IResponseData> {
    return { data: { success: true } }
  }
}

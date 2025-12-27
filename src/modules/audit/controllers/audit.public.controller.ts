import { Controller, Post, VERSION_NEUTRAL } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ENUM_LOGGER_TYPE } from 'lib/nest-logger'
import { ApiRequestData, IResponseData, RequestBody } from 'lib/nest-web'
import { AUDIT_DOC_OPERATION } from '../constants'
import { AuditRequestEntryDto } from '../dtos'
import { AuditService } from '../services'

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
  async createEntry(@RequestBody() body: AuditRequestEntryDto): Promise<IResponseData> {
    try {
      if (body.data.context === ENUM_LOGGER_TYPE.HTTP) {
        const data = this.auditService.toHttpData(body)
        await this.auditService.saveHttpData(data)
      }
    } catch {}
    return { data: { success: true } }
  }
}

import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { RESPONSE_CONTENT_OK } from '../constants'

@ApiTags('Health')
@Controller('/health')
export class HealthController {
  @Get('/ready')
  @ApiOperation({ summary: 'Check app ready' })
  @ApiOkResponse({ type: String })
  async ready(): Promise<string> {
    return RESPONSE_CONTENT_OK
  }

  @Get('/live')
  @ApiOperation({ summary: 'Check app live' })
  @ApiOkResponse({ type: String })
  async live(): Promise<string> {
    return RESPONSE_CONTENT_OK
  }
}

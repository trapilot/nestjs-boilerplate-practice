import { Controller, Get } from '@nestjs/common'
import { APP_RESPONSE } from 'lib/nest-web'

@Controller({ path: '/' })
export class AppController {
  @Get('/')
  async ping(): Promise<any> {
    return APP_RESPONSE
  }
}

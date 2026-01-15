import { HttpStatus, Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import { SettingService } from 'modules/setting'

@Injectable()
export class MaintenanceCheckMiddleware implements NestMiddleware {
  constructor(private readonly settingService: SettingService) {}

  async use(_req: IRequestApp, _res: IResponseApp, next: INextFunction): Promise<void> {
    const isMaintenance = await this.settingService.getMaintenance()

    if (isMaintenance === true) {
      throw new ServiceUnavailableException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'http.serverError.serviceMaintenance',
      })
    }

    next()
  }
}

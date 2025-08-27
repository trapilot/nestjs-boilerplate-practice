import { HttpStatus, Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import { SettingService } from '../services'

@Injectable()
export class SettingMaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly settingService: SettingService) {}

  async use(_req: IRequestApp, _res: IResponseApp, next: INextFunction): Promise<void> {
    const maintenance = await this.settingService.getMaintenance()

    if (maintenance === true) {
      throw new ServiceUnavailableException({
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'http.serverError.serviceMaintenance',
      })
    }

    next()
  }
}

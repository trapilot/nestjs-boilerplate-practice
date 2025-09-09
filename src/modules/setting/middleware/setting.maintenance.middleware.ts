import {
  HttpStatus,
  Injectable,
  NestMiddleware,
  RequestMethod,
  ServiceUnavailableException,
} from '@nestjs/common'
import { MiddlewareConsumer } from '@nestjs/common/interfaces'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import { SettingService } from '../services'

@Injectable()
export class SettingMaintenanceMiddleware implements NestMiddleware {
  constructor(private readonly settingService: SettingService) {}

  static configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(this)
      .exclude(
        { path: 'admin/auth/login', method: RequestMethod.POST },
        { path: 'admin/auth/refresh', method: RequestMethod.POST },
        { path: 'admin/settings', method: RequestMethod.ALL },
        { path: 'admin/settings/:splat', method: RequestMethod.ALL },
      )
      .forRoutes('*')
  }

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

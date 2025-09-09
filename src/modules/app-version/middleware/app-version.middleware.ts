import {
  HttpStatus,
  HttpVersionNotSupportedException,
  Injectable,
  NestMiddleware,
  RequestMethod,
} from '@nestjs/common'
import { MiddlewareConsumer } from '@nestjs/common/interfaces'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import { AppVersionService } from '../services'

@Injectable()
export class AppVersionMiddleware implements NestMiddleware {
  constructor(protected readonly appVersionService: AppVersionService) {}

  static configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(this)
      .forRoutes(
        { path: 'app/*spat', method: RequestMethod.ALL },
        { path: 'v:version/app/*spat', method: RequestMethod.ALL },
        { path: 'web/*spat', method: RequestMethod.ALL },
        { path: 'v:version/web/*spat', method: RequestMethod.ALL },
      )
  }

  async use(req: IRequestApp, _: IResponseApp, next: INextFunction): Promise<void> {
    let noLongerSupported = false
    const metadata: any = {}
    try {
      const userAgent = JSON.parse(req.headers['x-user-agent'] as string)
      const appVersion = await this.appVersionService.findFirst({
        where: {
          type: userAgent.device.type,
          isActive: true,
        },
      })

      noLongerSupported = userAgent.version < appVersion.version
      metadata.app = {
        version: appVersion.version,
        url: appVersion.url,
      }
    } catch (_: unknown) {}

    if (noLongerSupported === true) {
      throw new HttpVersionNotSupportedException({
        statusCode: HttpStatus.HTTP_VERSION_NOT_SUPPORTED,
        message: 'http.clientError.appVersionNoLongerSupported',
        metadata,
      })
    }

    next()
  }
}

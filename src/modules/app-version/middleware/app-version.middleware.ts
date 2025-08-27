import {
  HttpStatus,
  HttpVersionNotSupportedException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import { AppVersionService } from '../services'

@Injectable()
export class AppVersionMiddleware implements NestMiddleware {
  constructor(protected readonly appVersionService: AppVersionService) {}

  async use(req: IRequestApp, res: IResponseApp, next: INextFunction): Promise<void> {
    let noLongerSupported = false
    let metadata: any = {}
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
    } catch (err: unknown) {}

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

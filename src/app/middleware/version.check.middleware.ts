import {
  HttpStatus,
  HttpVersionNotSupportedException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common'
import {
  EnumRouteType,
  INextFunction,
  IRequestApp,
  IResponseApp,
  ScopeContext,
} from 'lib/nest-core'
import { AppVersionService } from 'modules/app-version'

@Injectable()
export class VersionCheckMiddleware implements NestMiddleware {
  constructor(protected readonly appVersionService: AppVersionService) {}

  async use(req: IRequestApp, _res: IResponseApp, next: INextFunction): Promise<void> {
    if (!ScopeContext.isReqRoute(EnumRouteType.APP)) {
      return next()
    }

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
    } catch (_err: unknown) {}

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

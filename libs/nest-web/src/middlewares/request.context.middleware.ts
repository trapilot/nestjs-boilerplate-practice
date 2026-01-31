import { Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  APP_TIMEZONE,
  EnumRoutePath,
  EnumRouteType,
  EnumScopeType,
  HelperService,
  INextFunction,
  IRequestApp,
  IResponseApp,
  IScopeContextData,
  ScopeContext,
} from 'lib/nest-core'

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService,
    private readonly helperService: HelperService,
  ) {}

  async use(req: IRequestApp, _res: IResponseApp, next: INextFunction): Promise<void> {
    const ctxData: IScopeContextData = {
      scopeType: EnumScopeType.HTTP,
      http: {
        route: this.parseReqRoute(req),
        version: this.parseReqVersion(req),
        language: this.parseReqLanguage(req),
        timezone: this.parseReqTimezone(req),
        tenantId: this.parseReqTenant(req),
      },
      logger: {
        context: `http.${this.parseReqRoute(req)}`,
      },
    }

    req.__version = ctxData.http.version
    req.__language = ctxData.http.language
    req.__timezone = ctxData.http.timezone

    ScopeContext.create(ctxData, next)
  }

  private parseReqRoute(req: IRequestApp): EnumRouteType {
    if (req.originalUrl.includes(EnumRoutePath.CMS)) {
      return EnumRouteType.CMS
    } else if (req.originalUrl.includes(EnumRoutePath.APP)) {
      return EnumRouteType.APP
    } else if (req.originalUrl.includes(EnumRoutePath.WEB)) {
      return EnumRouteType.WEB
    }
    return EnumRouteType.PUB
  }

  private parseReqVersion(req: IRequestApp): string {
    const globalPrefix = this.config.get<string>('app.http.prefix')
    const versionNumber = this.config.get<string>('app.urlVersion.version')
    const versionPrefix = this.config.get<string>('app.urlVersion.prefix')

    const originalUrl: string = req.originalUrl
    if (originalUrl.startsWith(`/${globalPrefix}/${versionPrefix}`)) {
      const url: string[] = originalUrl.split('/')
      return url[2].replace(versionPrefix, '')
    }
    return versionNumber
  }

  private parseReqLanguage(req: IRequestApp): string {
    const language: string = this.config.get<string>('helper.message.fallback')
    try {
      const reqLanguage: string = req.headers['x-language'] as string
      if (reqLanguage) {
        const availableLanguages = this.config.get<string[]>('helper.message.availableList')
        const languages: string[] = this.helperService.arrayIntersection(
          [reqLanguage],
          availableLanguages,
        )

        if (languages.length > 0) {
          return reqLanguage
        }
      }
    } catch {}
    return language
  }

  private parseReqTimezone(req: IRequestApp): string {
    try {
      const userTz = req.headers['x-timezone'] as string
      if (userTz && this.helperService.dateCheckZone(userTz)) {
        return userTz
      }
    } catch {}
    return APP_TIMEZONE
  }

  private parseReqTenant(req: IRequestApp): string {
    return req.headers['x-tenant-id'] as string
  }
}

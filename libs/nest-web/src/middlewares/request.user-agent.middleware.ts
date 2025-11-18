import { Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  APP_TIMEZONE,
  AppContext,
  AppHelper,
  HelperArrayService,
  HelperDateService,
  INextFunction,
  IRequestApp,
  IRequestContext,
  IResponseApp,
} from 'lib/nest-core'

@Injectable()
export class RequestUserAgentMiddleware implements NestMiddleware {
  constructor(
    private readonly config: ConfigService,
    private readonly helperDateService: HelperDateService,
    private readonly helperArrayService: HelperArrayService,
  ) {}

  async use(req: IRequestApp, _res: IResponseApp, next: INextFunction): Promise<void> {
    const ctxData = this.parseDataContext(req)

    req.__version = ctxData.apiVersion
    req.__timezone = ctxData.timezone
    req.__language = ctxData.language

    AppContext.create(new AppContext(ctxData), next)
  }

  private parseDataContext(req: IRequestApp): IRequestContext {
    return {
      apiType: AppHelper.getApiType(req.originalUrl),
      apiVersion: this.parseApiVersion(req),
      language: this.parseUserLanguage(req),
      timezone: this.parseUserTimezone(req),
    }
  }

  private parseApiVersion(req: IRequestApp): string {
    const versionNumber = this.config.get<string>('app.urlVersion.version')

    const globalPrefix = this.config.get<string>('app.globalPrefix')
    const versionPrefix = this.config.get<string>('app.urlVersion.prefix')

    const originalUrl: string = req.originalUrl
    if (originalUrl.startsWith(`${globalPrefix}/${versionPrefix}`)) {
      const url: string[] = originalUrl.split('/')
      return url[2].replace(versionPrefix, '')
    }
    return versionNumber
  }

  private parseUserLanguage(req: IRequestApp): string {
    const language: string = this.config.get<string>('app.message.fallback')
    try {
      const reqLanguage: string = req.headers['x-language'] as string
      if (reqLanguage) {
        const availableLanguages = this.config.get<string[]>('app.message.availableList')
        const languages: string[] = this.helperArrayService.getIntersection(
          [reqLanguage],
          availableLanguages,
        )

        if (languages.length > 0) {
          return reqLanguage
        }
      }
    } catch (err: unknown) {}
    return language
  }

  private parseUserTimezone(req: IRequestApp): string {
    try {
      const userTz = req.headers['x-timezone'] as string
      if (userTz && this.helperDateService.checkZone(userTz)) {
        return userTz
      }
    } catch (err: unknown) {}
    return APP_TIMEZONE
  }
}

import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cors from 'cors'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'

@Injectable()
export class RequestCorsMiddleware implements NestMiddleware {
  private readonly allowOrigin: string | boolean | string[]
  private readonly allowMethod: string[]
  private readonly allowHeader: string[]
  private readonly exposeHeader: string[]

  constructor(private readonly config: ConfigService) {
    this.allowOrigin = this.config.get<string | boolean | string[]>('middleware.cors.allowOrigin')
    this.allowMethod = this.config.get<string[]>('middleware.cors.allowMethod')
    this.allowHeader = this.config.get<string[]>('middleware.cors.allowHeader')
    this.exposeHeader = this.config.get<string[]>('middleware.cors.exposeHeader')
  }

  use(req: IRequestApp, res: IResponseApp, next: INextFunction): void {
    const corsOptions: cors.CorsOptions = {
      origin: this.allowOrigin,
      methods: this.allowMethod,
      allowedHeaders: this.allowHeader,
      exposedHeaders: this.exposeHeader,
      preflightContinue: false,
      credentials: true,
      optionsSuccessStatus: HttpStatus.NO_CONTENT,
    }

    cors(corsOptions)(req, res, next)
  }
}

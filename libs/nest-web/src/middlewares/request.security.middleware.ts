import { Injectable, NestMiddleware } from '@nestjs/common'
import helmet from 'helmet'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'

@Injectable()
export class RequestSecurityMiddleware implements NestMiddleware {
  use(req: IRequestApp, res: IResponseApp, next: INextFunction) {
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Content-Security-Policy', "default-src 'self'")

    helmet()(req, res, next)
  }
}

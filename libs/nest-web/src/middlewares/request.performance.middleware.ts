import { Injectable, NestMiddleware } from '@nestjs/common'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'
import responseTime from 'response-time'

@Injectable()
export class RequestPerformanceMiddleware implements NestMiddleware {
  async use(req: IRequestApp, res: IResponseApp, next: INextFunction): Promise<void> {
    responseTime((_req: IRequestApp, res: IResponseApp, time: number) => {
      res.setHeader('X-Response-Time', `${Math.round(time)}ms`)
    })(req, res, next)
  }
}

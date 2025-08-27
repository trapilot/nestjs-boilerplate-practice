import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { APP_LANGUAGE, IRequestApp, IResponseApp } from 'lib/nest-core'
import { Observable } from 'rxjs'

// only for response success and error in controller
@Injectable()
export class ResponseHeadersInterceptor<T> implements NestInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    res.setHeader('x-language', req.__language || APP_LANGUAGE)
    res.setHeader('x-timezone', req.__timezone)
    res.setHeader('x-version', req.__version)

    return next.handle()
  }
}

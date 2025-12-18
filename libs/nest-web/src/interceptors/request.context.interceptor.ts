import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { APP_LANGUAGE, IRequestApp, IResponseApp } from 'lib/nest-core'
import { Observable, TimeoutError, throwError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'
import { REQUEST_TIMEOUT_METADATA } from '../constants'

@Injectable()
export class RequestContextInterceptor<T> implements NestInterceptor<T> {
  private readonly maxTimeout: number

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.maxTimeout = this.config.get<number>('middleware.timeout')
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    if (context.getType() !== 'http') {
      return next.handle()
    }

    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    this.applyHeaders(req, res)

    const timeoutMs = this.resolveTimeout(context)

    return next.handle().pipe(timeout(timeoutMs), catchError(this.handleTimeout))
  }

  private applyHeaders(req: IRequestApp, res: IResponseApp) {
    res.setHeader('x-language', req.__language || APP_LANGUAGE)
    res.setHeader('x-timezone', req.__timezone)
    res.setHeader('x-version', req.__version)
  }

  private resolveTimeout(context: ExecutionContext): number {
    return (
      this.reflector.get<number>(REQUEST_TIMEOUT_METADATA, context.getHandler()) ?? this.maxTimeout
    )
  }

  private handleTimeout(err: any) {
    if (err instanceof TimeoutError) {
      throw new RequestTimeoutException({
        statusCode: HttpStatus.REQUEST_TIMEOUT,
        message: 'http.clientError.requestTimeout',
      })
    }
    return throwError(() => err)
  }
}

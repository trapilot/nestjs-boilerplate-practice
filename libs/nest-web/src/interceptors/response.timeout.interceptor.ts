import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'
import { Observable, TimeoutError, throwError } from 'rxjs'
import { catchError, timeout } from 'rxjs/operators'
import { REQUEST_TIMEOUT_METADATA } from '../constants'

@Injectable()
export class ResponseTimeoutInterceptor<T> implements NestInterceptor<T> {
  private readonly maxTimeoutInMilliseconds: number

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.maxTimeoutInMilliseconds = this.config.get<number>('middleware.timeout')
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    if (context.getType() === 'http') {
      const msTimeout = this.reflector.get<number>(REQUEST_TIMEOUT_METADATA, context.getHandler())

      return next.handle().pipe(
        timeout(msTimeout ? msTimeout : this.maxTimeoutInMilliseconds),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            throw new RequestTimeoutException({
              statusCode: HttpStatus.REQUEST_TIMEOUT,
              message: 'http.clientError.requestTimeout',
            })
          }
          return throwError(() => err)
        }),
      )
    }

    return next.handle()
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { catchError, Observable, throwError } from 'rxjs'
import { LOGGER_ERROR_KEY } from '../constants'

@Injectable()
export class LoggerErrorInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      catchError(error => {
        return throwError(() => {
          const response = context.switchToHttp().getResponse()

          response[LOGGER_ERROR_KEY] = error

          return error
        })
      })
    )
  }
}

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer'
import { HelperDateService, IRequestApp, IResponseApp, NestContext } from 'lib/nest-core'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { RESPONSE_DTO_CONSTRUCTOR_METADATA, RESPONSE_DTO_OPTIONS_METADATA } from '../constants'
import { ResponseMetadataDto } from '../dtos'
import { IResponseBody, IResponseData } from '../interfaces'

@Injectable()
export class ResponseDataInterceptor<T> implements NestInterceptor<T, IResponseData> {
  constructor(
    private readonly reflector: Reflector,
    private readonly helperDateService: HelperDateService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return next.handle().pipe(
        map((res: IResponseData) => {
          return this.send(context, res)
        }),
        catchError((err) => {
          return throwError(() => err)
        }),
      )
    }

    return next.handle()
  }

  private send(context: ExecutionContext, responseData: IResponseData): IResponseBody {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_CONSTRUCTOR_METADATA,
      context.getHandler(),
    )

    const dtoOptions = this.reflector.get<ClassTransformOptions>(
      RESPONSE_DTO_OPTIONS_METADATA,
      context.getHandler(),
    )

    // metadata
    const dateNow = this.helperDateService.create()
    const ctxData = NestContext.current()
    let metadata: ResponseMetadataDto = {
      path: req.path,
      language: ctxData?.language ?? NestContext.language(),
      timezone: ctxData?.timezone ?? NestContext.timezone(),
      version: ctxData?.apiVersion ?? NestContext.apiVersion(),
      timestamp: this.helperDateService.getTimestamp(dateNow),
    }

    let statusHttp = res.statusCode
    let result = responseData.data

    const { _metadata } = responseData
    const customProperty = _metadata?.customProperty

    if (result && dtoClass) {
      if (customProperty?.serializeProperties) {
        result = { __metadata: customProperty.serializeProperties, ...result }
      }

      result = plainToInstance(dtoClass, result, {
        excludeExtraneousValues: true,
        groups: [req?.user?.loginFrom, req?.user?.scopeType],
        ...dtoOptions,
      })
    }

    delete _metadata?.customProperty

    metadata = {
      ...metadata,
      ..._metadata,
    }

    res
      .setHeader('x-language', metadata.language)
      .setHeader('x-timezone', metadata.timestamp)
      .setHeader('x-version', metadata.version)
      .status(statusHttp)

    return {
      success: true,
      metadata,
      result,
    }
  }
}

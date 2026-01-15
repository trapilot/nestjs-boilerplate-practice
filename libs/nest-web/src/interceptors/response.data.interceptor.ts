import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { ClassConstructor, ClassTransformOptions } from 'class-transformer'
import {
  HelperService,
  IRequestApp,
  IResponseApp,
  ResponseMetadataDto,
  ResponseSuccessDto,
  ScopeContext,
} from 'lib/nest-core'
import { Observable, throwError } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { RESPONSE_DTO_CONSTRUCTOR_METADATA, RESPONSE_DTO_TRANSFORM_METADATA } from '../constants'
import { IResponseData } from '../interfaces'
import { ResponseUtil } from '../utils'

@Injectable()
export class ResponseDataInterceptor<T, R> implements NestInterceptor<T, IResponseData<R>> {
  constructor(
    private readonly reflector: Reflector,
    private readonly helperService: HelperService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle()
    }

    return next.handle().pipe(
      map((res: IResponseData<R>) => this.send(context, res)),
      catchError((err) => throwError(() => err)),
    )
  }

  private send(context: ExecutionContext, response: IResponseData<R>): ResponseSuccessDto {
    const ctx: HttpArgumentsHost = context.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    const dtoClass = this.reflector.get<ClassConstructor<any>>(
      RESPONSE_DTO_CONSTRUCTOR_METADATA,
      context.getHandler(),
    )

    const dtoTransform = this.reflector.get<ClassTransformOptions>(
      RESPONSE_DTO_TRANSFORM_METADATA,
      context.getHandler(),
    )

    const dtoGroups = [req?.user?.loginFrom, req?.user?.scopeType]

    // metadata
    const nowDate = this.helperService.dateNow()
    const ctxData = ScopeContext.getReqData()
    let metadata: ResponseMetadataDto = {
      path: req.path,
      language: ctxData.language,
      timezone: ctxData.timezone,
      version: ctxData.version,
      timestamp: this.helperService.dateGetTimestamp(nowDate),
    }

    const statusHttp = res.statusCode
    let result = response.data

    if (result && dtoClass) {
      result = ResponseUtil.mapToInstance(result, {
        type: dtoClass,
        transform: { ...dtoGroups, ...dtoTransform },
        mappingProperties: response?.metadata?.mappingProperties,
      })
    }

    metadata = {
      ...response.metadata,
      ...metadata,
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

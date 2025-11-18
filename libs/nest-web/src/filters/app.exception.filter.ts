import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import {
  AppContext,
  HelperDateService,
  HelperMessageService,
  IMessageError,
  IMessageProperties,
  IRequestApp,
  IResponseApp,
  IResponseException,
} from 'lib/nest-core'
import { ResponseMetadataDto } from '../dtos'
import { IResponseFailure } from '../interfaces'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly helperDateService: HelperDateService,
    private readonly helperMessageService: HelperMessageService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    // metadata
    const dateNow = this.helperDateService.create()
    const ctxData = AppContext.current()
    let metadata: ResponseMetadataDto = {
      path: req.path,
      language: ctxData?.language ?? AppContext.language(),
      timezone: ctxData?.timezone ?? AppContext.timezone(),
      version: ctxData?.apiVersion ?? AppContext.apiVersion(),
      timestamp: this.helperDateService.getTimestamp(dateNow),
    }

    if (req.__filters) {
      metadata.availableSearch = req.__filters?.availableSearch ?? []
      metadata.availableOrderBy = req.__filters?.availableOrderBy ?? []
    }
    if (req.__pagination) {
      metadata.pagination = {
        ...{ page: 1, perPage: 1, totalPage: 1, totalRecord: 0 },
        ...req.__pagination,
      }
    }

    // default
    let statusHttp: number = HttpStatus.INTERNAL_SERVER_ERROR
    let statusCode: number = statusHttp
    let messagePath: string = `http.${statusHttp}`
    let messageDetails: IMessageError[] = []
    let messageProperties: IMessageProperties = undefined

    // restructure
    if (exception instanceof HttpException) {
      const responseException = exception.getResponse()
      statusHttp = exception.getStatus()
      statusCode = statusHttp
      messagePath = `http.${statusHttp}`

      if (this.isExceptionError(responseException)) {
        const { metadata: _metadata } = responseException

        statusCode = responseException.statusCode
        messagePath = responseException.message
        messageProperties = _metadata?.customProperty?.messageProperties
        delete _metadata?.customProperty

        metadata = {
          ...metadata,
          ..._metadata,
        }

        // errors
        if (this.hasResponseErrors(responseException)) {
          messageDetails = this.helperMessageService.setValidationMessage(
            responseException.errors,
            {
              customLanguage: metadata.language,
            },
          )
        }
      }
    }

    const message = this.helperMessageService.setMessage(messagePath, {
      customLanguage: metadata.language,
      properties: messageProperties,
    })

    const responseBody: IResponseFailure = {
      success: false,
      metadata,
      error: {
        message,
        code: statusCode,
        details: messageDetails,
      },
    }

    res
      .setHeader('x-language', metadata.language)
      .setHeader('x-timezone', metadata.timezone)
      .setHeader('x-version', metadata.version)
      .status(statusHttp)
      .json(responseBody)

    return
  }

  private isExceptionError(obj: any): obj is IResponseException {
    return typeof obj === 'object' ? 'statusCode' in obj && 'message' in obj : false
  }

  private hasResponseErrors(obj: IResponseException): boolean {
    return 'errors' in obj && obj.errors.length > 0
  }
}

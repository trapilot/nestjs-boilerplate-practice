import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import {
  AppUtil,
  HelperService,
  IMessageError,
  IMessageProperties,
  IRequestApp,
  IResponseApp,
  LoggerService,
  MessageService,
  ResponseErrorDto,
  ResponseMetadataDto,
  ScopeContext,
} from 'lib/nest-core'
import { IResponseException } from '../interfaces'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly message: MessageService,
    private readonly helperService: HelperService,
  ) {}

  async catch(exception: HttpException, host: ArgumentsHost): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    // capture
    this.captureException(exception)

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
    const statusHttp: number = exception.getStatus()
    let statusCode: number = statusHttp
    let messagePath: string = `http.${statusHttp}`
    let messageDetails: IMessageError[] = []
    let messageProperties: IMessageProperties = undefined

    // restructure
    const responseException = exception.getResponse()
    if (this.isExceptionError(responseException)) {
      statusCode = responseException.statusCode
      messagePath = responseException.message
      messageProperties = responseException.messageProperties

      metadata = {
        ...responseException.metadata,
        ...metadata,
      }

      // errors
      if (this.hasResponseErrors(responseException)) {
        messageDetails = this.message.setValidationMessage(responseException.errors, {
          customLanguage: metadata.language,
        })
      }
    }

    const message = this.message.setMessage(messagePath, {
      customLanguage: metadata.language,
      properties: messageProperties,
    })

    const responseBody: ResponseErrorDto = {
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

  captureException(exception: unknown): void {
    try {
      this.logger.error(exception)
      AppUtil.captureException(exception)
    } catch (err: unknown) {
      console.log({ err })
    }

    return
  }
}

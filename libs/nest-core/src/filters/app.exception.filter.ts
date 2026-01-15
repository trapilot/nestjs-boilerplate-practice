import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { ResponseErrorDto, ResponseMetadataDto } from '../dtos'
import { ScopeContext } from '../helpers'
import { IRequestApp, IResponseApp } from '../interfaces'
import { HelperService, LoggerService, MessageService } from '../services'
import { AppUtil } from '../utils'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly message: MessageService,
    private readonly helperService: HelperService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    // capture
    this.captureException(exception)

    // metadata
    const nowDate = this.helperService.dateNow()
    const ctxData = ScopeContext.getReqData()
    const metadata: ResponseMetadataDto = {
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
    const statusHttp: number = HttpStatus.INTERNAL_SERVER_ERROR
    const messagePath: string = `http.internalServerError`

    const message = this.message.setMessage(messagePath, {
      customLanguage: metadata.language,
    })

    const responseBody: ResponseErrorDto = {
      success: false,
      metadata,
      error: {
        message,
        code: statusHttp,
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

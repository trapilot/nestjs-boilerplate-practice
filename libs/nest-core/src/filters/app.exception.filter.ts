import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { ResponseErrorDto, ResponseMetadataDto } from '../dtos'
import { AppContext } from '../helpers'
import { IRequestApp, IResponseApp } from '../interfaces'
import { HelperService, MessageService } from '../services'

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AppExceptionFilter.name)

  constructor(
    private readonly messageService: MessageService,
    private readonly helperService: HelperService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    // capture
    this.captureException(exception)

    // metadata
    const dateNow = this.helperService.dateCreate()
    const ctxData = AppContext.current()
    const metadata: ResponseMetadataDto = {
      path: req.path,
      language: ctxData?.language ?? AppContext.language(),
      timezone: ctxData?.timezone ?? AppContext.timezone(),
      version: ctxData?.apiVersion ?? AppContext.apiVersion(),
      timestamp: this.helperService.dateGetTimestamp(dateNow),
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

    const message = this.messageService.setMessage(messagePath, {
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
    } catch (err: unknown) {
      console.log({ err })
    }

    return
  }
}

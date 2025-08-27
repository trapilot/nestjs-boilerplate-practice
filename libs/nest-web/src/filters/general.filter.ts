import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { HttpAdapterHost } from '@nestjs/core'
import {
  EntityValidateException,
  HelperDateService,
  IRequestApp,
  IResponseApp,
  NestContext,
} from 'lib/nest-core'
import { FileImportException } from 'lib/nest-file'
import { ENUM_LOGGER_TYPE, LoggerService } from 'lib/nest-logger'
import { MessageService } from 'lib/nest-message'
import { ResponseMetadataDto } from '../dtos'
import { IResponseBody } from '../interfaces'

@Catch()
export class GeneralFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly messageService: MessageService,
    private readonly helperDateService: HelperDateService,
  ) {
    this.logger.setContext(ENUM_LOGGER_TYPE.SYSTEM)
  }

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const { httpAdapter } = this.httpAdapterHost

    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    // capture
    this.captureException(exception)

    if (exception instanceof HttpException) {
      const response = exception.getResponse()
      const statusHttp = exception.getStatus()

      httpAdapter.reply(ctx.getResponse(), response, statusHttp)
      return
    }

    // metadata
    const dateNow = this.helperDateService.create()
    const ctxData = NestContext.current()
    const metadata: ResponseMetadataDto = {
      path: req.path,
      language: ctxData?.language ?? NestContext.language(),
      timezone: ctxData?.timezone ?? NestContext.timezone(),
      version: ctxData?.apiVersion ?? NestContext.apiVersion(),
      timestamp: this.helperDateService.getTimestamp(dateNow),
    }

    // message
    const statusHttp = HttpStatus.BAD_REQUEST
    const message = this.messageService.setMessage(`http.${statusHttp}`, {
      customLanguage: metadata.language,
    })

    const responseBody: IResponseBody = {
      success: false,
      metadata,
      error: {
        message,
        code: `E5${statusHttp}`,
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
    // Ignore custom  errors
    if (exception instanceof EntityValidateException || exception instanceof FileImportException) {
      return
    }

    // Ignore http errors, except Internal Server Error
    if (exception instanceof HttpException) {
      if (!(exception instanceof InternalServerErrorException)) {
        return
      }
    }

    try {
      this.logger.error(exception)
    } catch (err: unknown) {
      console.log({ err })
    }

    return
  }
}

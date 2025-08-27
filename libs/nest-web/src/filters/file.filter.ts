import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { HelperDateService, IRequestApp, IResponseApp, NestContext } from 'lib/nest-core'
import { FileImportException } from 'lib/nest-file'
import { MessageService } from 'lib/nest-message'
import { ResponseMetadataDto } from '../dtos'
import { IResponseBody } from '../interfaces'

@Catch(FileImportException)
export class FileFilter implements ExceptionFilter {
  constructor(
    private readonly messageService: MessageService,
    private readonly helperDateService: HelperDateService,
  ) {}

  async catch(exception: FileImportException, host: ArgumentsHost): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

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
    const message = this.messageService.setMessage(exception.message, {
      customLanguage: metadata.language,
    })

    // errors
    const errors = this.messageService.setValidationImportMessage(exception.errors, {
      customLanguage: metadata.language,
    })

    const responseBody: IResponseBody = {
      success: false,
      metadata,
      error: {
        message,
        code: `F5${exception.statusCode}`,
        details: errors,
      },
    }

    res
      .setHeader('x-language', metadata.language)
      .setHeader('x-timezone', metadata.timestamp)
      .setHeader('x-version', metadata.version)
      .status(exception.httpStatus)
      .json(responseBody)

    return
  }
}

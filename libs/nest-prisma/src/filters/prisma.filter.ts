import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Prisma } from '@runtime/prisma-client'
import {
  AppContext,
  HelperService,
  IRequestApp,
  IResponseApp,
  MessageService,
  ResponseErrorDto,
  ResponseMetadataDto,
} from 'lib/nest-core'

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientValidationError,
)
export class PrismaFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaFilter.name)

  constructor(
    private readonly messageService: MessageService,
    private readonly helperService: HelperService,
  ) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
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

    // message
    const messageCode = exception?.code ? exception.code : 'P0000'
    const message = this.messageService.setMessage(`prisma.${messageCode}`, {
      customLanguage: metadata.language,
      properties: exception?.meta,
    })

    const responseBody: ResponseErrorDto = {
      success: false,
      metadata,
      error: {
        message,
        code: messageCode,
        error: this.shortErrorMessage(exception),
      },
    }

    res
      .setHeader('x-language', metadata.language)
      .setHeader('x-timezone', metadata.timezone)
      .setHeader('x-version', metadata.version)
      .status(HttpStatus.BAD_REQUEST)
      .json(responseBody)

    return
  }

  private shortErrorMessage(exception: any): any {
    const { message, code } = exception

    const trimMessage = message.trim('→')
    const shortMessage = trimMessage.substring(trimMessage.indexOf('→'))

    if (!code) {
      const sqlMessage = shortMessage.substring(shortMessage.indexOf('→'))
      const sqlError = sqlMessage.substring(sqlMessage.indexOf('\n\n'))
      return sqlError.substring(sqlError.indexOf('\n')).replace(/\n/g, '').trim('')
    }
    return shortMessage.substring(shortMessage.indexOf('\n')).replace(/\n/g, '').trim()
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

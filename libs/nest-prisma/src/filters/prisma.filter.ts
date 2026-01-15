import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { AppUtil, LoggerService, ScopeContext } from 'lib/nest-core'

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientValidationError
)
export class PrismaFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, _host: ArgumentsHost) {
    // capture
    this.captureException(exception)

    if (ScopeContext.isReq()) {
      const errorCode = exception?.code ?? 'P0000'
      throw new BadRequestException({
        statusCode: errorCode,
        message: `prisma.${errorCode}`,
        messageProperties: exception?.meta,
      })
    }
    throw new Error(this.shortErrorMessage(exception))
  }

  private shortErrorMessage(exception: any): string {
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
      AppUtil.captureException(exception)
    } catch (err: unknown) {
      console.log({ err })
    }

    return
  }
}

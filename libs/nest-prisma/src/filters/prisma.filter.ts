import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { LoggerService } from 'lib/nest-logger'

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientInitializationError,
  Prisma.PrismaClientValidationError,
)
export class PrismaFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, _host: ArgumentsHost) {
    // capture
    this.capture(exception)

    const errorCode = exception?.code ?? 'P0000'
    throw new BadRequestException({
      statusCode: errorCode,
      message: `prisma.${errorCode}`,
      metadata: {
        customProperty: {
          messageProperties: exception?.meta,
        },
      },
    })
  }

  private _shortErrorMessage(exception: any): string {
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

  capture(exception: unknown): void {
    try {
      this.logger.error(exception)
    } catch (err: unknown) {
      console.log({ err })
    }

    return
  }
}

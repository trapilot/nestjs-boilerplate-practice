import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import {
  FeatureDisabledException,
  HelperDateService,
  IRequestApp,
  IResponseApp,
  NestContext,
} from 'lib/nest-core'
import { IMessageOptionsProperties, MessageService } from 'lib/nest-message'
import { ResponseMetadataDto } from '../dtos'
import { IResponseBody, IResponseError } from '../interfaces'

@Catch(HttpException)
export class HttpFilter implements ExceptionFilter {
  constructor(
    private readonly messageService: MessageService,
    private readonly helperDateService: HelperDateService,
  ) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx: HttpArgumentsHost = host.switchToHttp()
    const req: IRequestApp = ctx.getRequest<IRequestApp>()
    const res: IResponseApp = ctx.getResponse<IResponseApp>()

    // metadata
    const dateNow = this.helperDateService.create()
    const ctxData = NestContext.current()
    let metadata: ResponseMetadataDto = {
      path: req.path,
      language: ctxData?.language ?? NestContext.language(),
      timezone: ctxData?.timezone ?? NestContext.timezone(),
      version: ctxData?.apiVersion ?? NestContext.apiVersion(),
      timestamp: this.helperDateService.getTimestamp(dateNow),
    }

    // console.log({ __filters: req.__filters })
    // if (req.__filters) {
    //   metadata = {
    //     ...metadata,
    //     availableSearch: req.__filters?.availableSearch ?? [],
    //     availableOrderBy: req.__filters?.availableOrderBy ?? [],
    //   }
    // }
    // if (req.__pagination) {
    //   metadata = {
    //     ...metadata,
    //     ...{ page: 1, perPage: 1, totalPage: 1, totalRecord: 1 },
    //     ...req.__pagination,
    //   }
    // }

    // message
    let statusHttp = HttpStatus.BAD_REQUEST
    let messagePath = `http.${statusHttp}`
    let messageProperties: IMessageOptionsProperties = undefined
    if (exception instanceof HttpException) {
      // Restructure
      const responseException = exception.getResponse()
      messagePath = `http.${exception.getStatus()}`

      if (this.isErrorException(responseException)) {
        const { metadata: _metadata } = responseException

        statusHttp = responseException.statusCode
        messagePath = responseException.message
        messageProperties = _metadata?.customProperty?.messageProperties
        delete _metadata?.customProperty

        metadata = {
          ...metadata,
          ..._metadata,
        }
      }
    }

    const message = this.messageService.setMessage(messagePath, {
      customLanguage: metadata.language,
      properties: messageProperties,
    })

    const responseBody: IResponseBody = {
      success: false,
      metadata,
      error: {
        message,
        code: `H5${statusHttp}`,
      },
    }

    res
      .setHeader('x-language', metadata.language)
      .setHeader('x-timezone', metadata.timezone)
      .setHeader('x-version', metadata.version)
      .status(this.isFeatureDisabledException(exception) ? HttpStatus.OK : statusHttp)
      .json(responseBody)

    return
  }

  private isErrorException(obj: any): obj is IResponseError {
    return typeof obj === 'object' ? 'statusCode' in obj && 'message' in obj : false
  }

  private isFeatureDisabledException(obj: any): boolean {
    return obj instanceof FeatureDisabledException
  }
}

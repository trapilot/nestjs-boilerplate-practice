import { HttpException, HttpStatus } from '@nestjs/common'

export class FeatureDisabledException extends HttpException {
  constructor(message?: string) {
    super(
      {
        statusCode: HttpStatus.NOT_IMPLEMENTED,
        message: message || 'http.serverError.notImplemented',
      },
      HttpStatus.NOT_IMPLEMENTED,
    )
  }
}

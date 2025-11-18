import { HttpException, HttpStatus } from '@nestjs/common'
import { ValidationError } from 'class-validator'

export class AppException extends HttpException {
  constructor(options: {
    message: string
    httpStatus: HttpStatus
    statusCode?: string | number
    errors?: ValidationError[]
    error?: string
  }) {
    super(
      {
        ...options,
        statusCode: options?.statusCode ?? options.httpStatus,
      },
      options.httpStatus,
    )
  }
}

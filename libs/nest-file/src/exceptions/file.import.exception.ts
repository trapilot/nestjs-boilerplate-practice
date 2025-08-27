import { HttpStatus } from '@nestjs/common'
import { IFileValidationImportError } from '../interfaces'

export class FileImportException extends Error {
  readonly httpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY
  readonly statusCode: number = HttpStatus.UNPROCESSABLE_ENTITY
  readonly errors: IFileValidationImportError[]

  constructor(errors: IFileValidationImportError[]) {
    super('file.error.validationDto')
    this.errors = errors
  }
}

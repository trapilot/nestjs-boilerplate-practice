import { HttpStatus } from '@nestjs/common'
import { ValidationError } from 'class-validator'

interface IEntityValidateError {
  property: string
  target?: any
  value?: any
  constraints?: {
    [type: string]: any
  }
}

export class EntityValidateException extends Error {
  readonly httpStatus: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY
  readonly statusCode: number = HttpStatus.UNPROCESSABLE_ENTITY
  readonly errors: ValidationError[]

  constructor(errors: ValidationError[]) {
    super('request.validation')

    this.errors = errors
  }

  static builder(): EntityValidateBuilder {
    return new EntityValidateBuilder()
  }
}

export class EntityValidateBuilder {
  private errors: ValidationError[] = []

  addError(options: IEntityValidateError): this {
    if (this.errors.some((err) => err.property === options.property)) {
      return this
    }

    const error = new ValidationError()
    error.property = options.property
    error.target = options?.target
    error.value = options?.value
    error.constraints = options?.constraints

    this.errors.push(error)
    return this
  }

  hasError(): boolean {
    return this.errors.length > 0
  }

  addErrors(errors: IEntityValidateError[]): this {
    errors.forEach((e) => this.addError(e))
    return this
  }

  build(): EntityValidateException {
    return new EntityValidateException(this.errors)
  }

  throw(): never {
    throw this.build()
  }
}

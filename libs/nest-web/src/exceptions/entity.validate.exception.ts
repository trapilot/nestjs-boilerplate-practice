import { HttpStatus } from '@nestjs/common'
import { ValidationError } from 'class-validator'
import { AppException } from 'lib/nest-core'

export class EntityValidateException extends AppException {
  constructor(errors: ValidationError[]) {
    super({
      message: 'request.validation',
      httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
      errors,
    })
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

interface IEntityValidateError {
  property: string
  target?: any
  value?: any
  constraints?: {
    [type: string]: any
  }
}

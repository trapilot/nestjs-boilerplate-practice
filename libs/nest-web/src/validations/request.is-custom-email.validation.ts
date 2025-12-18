import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { HelperService, MessageService } from 'lib/nest-core'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCustomEmailConstraint implements ValidatorConstraintInterface {
  constructor(
    protected readonly messageService: MessageService,
    protected readonly helperService: HelperService,
  ) {}

  validate(value: string): boolean {
    const { validated } = this.helperService.checkEmail(value)
    return validated
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const { message } = this.helperService.checkEmail(validationArguments.value)
    return this.messageService.setMessage(message)
  }
}

export function IsCustomEmail(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsCustomEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCustomEmailConstraint,
    })
  }
}

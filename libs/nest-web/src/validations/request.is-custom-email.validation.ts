import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { HelperMessageService, HelperStringService } from 'lib/nest-core'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCustomEmailConstraint implements ValidatorConstraintInterface {
  constructor(
    protected readonly helperStringService: HelperStringService,
    private readonly helperMessageService: HelperMessageService,
  ) {}

  validate(value: string): boolean {
    const { validated } = this.helperStringService.checkEmail(value)
    return validated
  }

  defaultMessage(validationArguments?: ValidationArguments): string {
    const { message } = this.helperStringService.checkEmail(validationArguments.value)
    return this.helperMessageService.setMessage(message)
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

import { Injectable } from '@nestjs/common'
import {
  isStrongPassword,
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (value) {
      return isStrongPassword(value, {
        minLength: 6,
        minLowercase: 0,
        minNumbers: 0,
        minSymbols: 0,
        minUppercase: 0,
      })
    }
    return false
  }
}

export function IsPassword(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPasswordConstraint,
    })
  }
}

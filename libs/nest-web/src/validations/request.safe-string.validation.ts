import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class SafeStringConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (value) {
      const regex = new RegExp('^[A-Za-z0-9_-]+$')
      return regex.test(value)
    }
    return false
  }
}

export function SafeString(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'SafeString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: SafeStringConstraint,
    })
  }
}

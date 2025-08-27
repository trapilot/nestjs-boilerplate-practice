import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsRatioConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    const number = Number.parseFloat(value)
    return number >= 0 || number <= 100
  }
}

export function IsRatio(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsRatio',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRatioConstraint,
    })
  }
}

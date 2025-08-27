import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsDurationConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean {
    if (value) {
      const regex = new RegExp(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
      return regex.test(value)
    }
    return false
  }
}

export function IsDuration(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsDuration',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDurationConstraint,
    })
  }
}

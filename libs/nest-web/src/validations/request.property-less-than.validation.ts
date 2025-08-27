import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class PropertyLessThanEqualConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const [property] = args.constraints
    const relatedValue = args.object[property]
    return value <= relatedValue
  }
}

export function PropertyLessThanEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'PropertyLessThanEqual',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PropertyLessThanEqualConstraint,
    })
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class PropertyLessThanConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const [property] = args.constraints
    const relatedValue = args.object[property]
    return value < relatedValue
  }
}

export function PropertyLessThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'PropertyLessThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PropertyLessThanConstraint,
    })
  }
}

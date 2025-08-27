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
export class PropertyGreaterThanEqualConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const [property] = args.constraints
    const relatedValue = args.object[property]
    return value >= relatedValue
  }
}

export function PropertyGreaterThanEqual(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'PropertyGreaterThanEqual',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PropertyGreaterThanEqualConstraint,
    })
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class PropertyGreaterThanConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const [property] = args.constraints
    const relatedValue = args.object[property]
    return value > relatedValue
  }
}

export function PropertyGreaterThan(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'PropertyGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: PropertyGreaterThanConstraint,
    })
  }
}

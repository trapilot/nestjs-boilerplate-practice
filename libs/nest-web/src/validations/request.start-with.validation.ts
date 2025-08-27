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
export class StartWithConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    const [prefix] = args.constraints
    const check = prefix.find((val: string) => value.startsWith(val))
    return check ?? false
  }
}

export function IsStartWith(prefix: string[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'StartWith',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [prefix],
      validator: StartWithConstraint,
    })
  }
}

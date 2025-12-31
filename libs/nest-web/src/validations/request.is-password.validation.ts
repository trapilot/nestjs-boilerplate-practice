import { Injectable } from '@nestjs/common'
import {
  isStrongPassword,
  IsStrongPasswordOptions,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    if (!value) return false

    const [passwordOptions] = args.constraints

    return isStrongPassword(value, {
      minLength: 6,
      minLowercase: 0,
      minNumbers: 0,
      minSymbols: 0,
      minUppercase: 0,
      ...passwordOptions,
    })

    return false
  }
}

export function IsPassword(
  passwordOptions?: IsStrongPasswordOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [passwordOptions],
      validator: IsPasswordConstraint,
    })
  }
}

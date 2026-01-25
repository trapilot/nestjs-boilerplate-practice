import { Injectable } from '@nestjs/common'
import {
  isEmail,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    if (!value) return false

    const [emailOptions] = args.constraints

    return isEmail(value, {
      allow_ip_domain: false,
      allow_utf8_local_part: false,
      ...emailOptions,
    })
  }
}

export function IsEmail(
  emailOptions?: Record<string, string>,
  validationOptions?: ValidationOptions,
) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [emailOptions],
      validator: IsEmailConstraint,
    })
  }
}

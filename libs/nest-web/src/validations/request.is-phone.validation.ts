import { Injectable } from '@nestjs/common'
import {
  isPhoneNumber,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { CountryCode } from 'libphonenumber-js/types.cjs'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments): boolean {
    if (!value) return false

    const [regions] = args.constraints
    if (regions && regions.length) {
      for (const region in regions) {
        if (isPhoneNumber(value, region as CountryCode)) {
          return true
        }
      }
      return false
    }

    // return isPhoneNumber(value)
    return true
  }
}

export function IsPhone(regions?: string[], validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [regions],
      validator: IsPhoneConstraint,
    })
  }
}

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class HasAllowCountryConstraint implements ValidatorConstraintInterface {
  constructor(private readonly config: ConfigService) {}

  async validate(value: string, _args: ValidationArguments): Promise<boolean> {
    if (!value) return false

    const countryList = this.config.getOrThrow<string[]>('module.country.availableList')
    if (countryList.find((code: string) => value.startsWith(code))) {
      return /^[+-]?\d+(\.\d+)?$/.test(value)
    }
    return false
  }
}

export function HasAllowCountry(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'HasAllowCountry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasAllowCountryConstraint,
    })
  }
}

import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsAllowCountryConstraint implements ValidatorConstraintInterface {
  constructor(private readonly config: ConfigService) {}

  async validate(value: string): Promise<boolean> {
    const countryList = this.config.getOrThrow<string[]>('module.country.availableList')

    return !!countryList.find((code: string) => value.startsWith(code))
  }
}

export function IsAllowCountry(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'IsAllowCountry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAllowCountryConstraint,
    })
  }
}

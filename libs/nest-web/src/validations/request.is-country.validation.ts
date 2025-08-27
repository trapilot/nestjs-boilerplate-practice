import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsCountryConstraint implements ValidatorConstraintInterface {
  constructor(private readonly config: ConfigService) {}
  async validate(value: string): Promise<boolean> {
    const codes = this.config.get<string[]>('app.country.availableList')
    const check = codes.find((val: string) => (value ?? '').startsWith(val))
    return !!check
  }
}

export function IsCountry(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsCountry',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCountryConstraint,
    })
  }
}

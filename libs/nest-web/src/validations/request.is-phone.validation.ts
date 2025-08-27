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
export class IsPhoneConstraint implements ValidatorConstraintInterface {
  constructor(private readonly config: ConfigService) {}
  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    const [options] = args.constraints
    if (options?.country === false) {
      return /^[+-]?\d+(\.\d+)?$/.test(value ?? '')
    }

    const codes = this.config.get<string[]>('app.country.availableList')
    const check = codes.find((val: string) => (value ?? '').startsWith(val))
    return !!check && /^[+-]?\d+(\.\d+)?$/.test(value ?? '')
  }
}

export function IsPhone(options?: { country: boolean }, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsPhoneConstraint,
    })
  }
}

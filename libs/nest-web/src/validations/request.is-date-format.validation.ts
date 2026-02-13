import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { EnumDateFormat, HelperService } from 'lib/nest-core'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsDateFormatConstraint implements ValidatorConstraintInterface {
  constructor(private readonly helperService: HelperService) {}

  validate(value: string, args: ValidationArguments): boolean {
    return this.helperService.dateCheckFormat(value, args.constraints[0])
  }
}

export function IsDateFormat(format: EnumDateFormat, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsDateFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [format],
      validator: IsDateFormatConstraint,
    })
  }
}

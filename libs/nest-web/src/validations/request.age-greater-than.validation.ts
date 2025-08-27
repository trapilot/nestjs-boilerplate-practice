import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { HelperDateService } from 'lib/nest-core'

@ValidatorConstraint({ async: true })
@Injectable()
export class AgeGreaterThanEqualConstraint implements ValidatorConstraintInterface {
  constructor(private readonly helperDateService: HelperDateService) {}

  validate(value: string, args: ValidationArguments): boolean {
    const [age] = args.constraints

    if (this.helperDateService.checkIso(value)) {
      const date = this.helperDateService.createFromIso(value)
      return this.helperDateService.calculateAge(date).years >= Number.parseInt(age)
    }
    return false
  }
}

export function AgeGreaterThanEqual(age: number, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): any {
    registerDecorator({
      name: 'AgeGreaterThanEqual',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [age],
      validator: AgeGreaterThanEqualConstraint,
    })
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class AgeGreaterThanConstraint implements ValidatorConstraintInterface {
  constructor(private readonly helperDateService: HelperDateService) {}

  validate(value: string, args: ValidationArguments): boolean {
    const [age] = args.constraints

    if (this.helperDateService.checkIso(value)) {
      const date = this.helperDateService.createFromIso(value)
      return this.helperDateService.calculateAge(date).years > Number.parseInt(age)
    }
    return false
  }
}

export function AgeGreaterThan(age: number, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): any {
    registerDecorator({
      name: 'AgeGreaterThan',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [age],
      validator: AgeGreaterThanConstraint,
    })
  }
}

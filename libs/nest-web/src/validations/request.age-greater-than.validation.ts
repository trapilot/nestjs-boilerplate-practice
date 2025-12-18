import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { DateService } from 'lib/nest-core'

@ValidatorConstraint({ async: true })
@Injectable()
export class AgeGreaterThanEqualConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dateService: DateService) {}

  validate(value: string, args: ValidationArguments): boolean {
    const [age] = args.constraints

    if (this.dateService.checkIso(value)) {
      const date = this.dateService.createFromIso(value)
      return this.dateService.calculateAge(date).years >= Number.parseInt(age)
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
  constructor(private readonly dateService: DateService) {}

  validate(value: string, args: ValidationArguments): boolean {
    const [age] = args.constraints

    if (this.dateService.checkIso(value)) {
      const date = this.dateService.createFromIso(value)
      return this.dateService.calculateAge(date).years > Number.parseInt(age)
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

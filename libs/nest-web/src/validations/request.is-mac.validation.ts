import { Injectable } from '@nestjs/common'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { HelperStringService } from 'lib/nest-core'

@ValidatorConstraint({ async: true })
@Injectable()
export class IsMACConstraint implements ValidatorConstraintInterface {
  constructor() {}

  validate(value: string): boolean {
    if (value) {
      const regex = new RegExp(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
      return regex.test(value)
    }
    return false
  }
}

export function IsMAC(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsMAC',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsMACConstraint,
    })
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
export class IsArrayMACConstraint implements ValidatorConstraintInterface {
  constructor(private readonly helperStringService: HelperStringService) {}

  validate(value: string[]): boolean {
    if (typeof value == 'string') {
      value = (value as string).split(',')
    }

    if (value.length) {
      const regex = new RegExp(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/)
      for (const addr of value) {
        if (!regex.test(addr)) {
          return false
        }
      }
      return true
    }
    return false
  }
}

export function IsArrayMAC(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string): void {
    registerDecorator({
      name: 'IsArrayMAC',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsArrayMACConstraint,
    })
  }
}

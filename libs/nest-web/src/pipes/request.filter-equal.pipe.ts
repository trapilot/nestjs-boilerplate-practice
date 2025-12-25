import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { AppHelper, IRequestApp } from 'lib/nest-core'
import { IRequestFilterEqualOptions } from '../interfaces'

export function RequestFilterEqualPipe(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterEqualPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: string,
      _metadata: ArgumentMetadata,
    ): Promise<Record<string, string | number>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value,
        }
      }

      const finalValue = AppHelper.parse(value, options)

      this.addToRequestInstance(finalValue)
      return {
        [field]: finalValue,
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterEqualPipe)
}

export function RequestFilterGreaterThanEqualPipe(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterGreaterThanEqualPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: string,
      _metadata: ArgumentMetadata,
    ): Promise<Record<string, { gte: string | number }>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: { gte: value },
        }
      }

      const finalValue = AppHelper.parse(value, options)

      this.addToRequestInstance(finalValue)
      return {
        [field]: { gte: finalValue },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterGreaterThanEqualPipe)
}

export function RequestFilterLessThanEqualPipe(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterLessThanEqualPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: string,
      _metadata: ArgumentMetadata,
    ): Promise<Record<string, { lte: string | number }>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: { lte: value },
        }
      }

      const finalValue = AppHelper.parse(value, options)

      this.addToRequestInstance(finalValue)
      return {
        [field]: { lte: finalValue },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterLessThanEqualPipe)
}

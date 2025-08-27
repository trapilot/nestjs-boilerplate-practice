import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp } from 'lib/nest-core'
import { IRequestFilterOptions } from '../interfaces'

export function RequestFilterInEnumPipe<T>(
  field: string,
  defaultEnum: Record<string, any>,
  defaultValue: T,
  options?: IRequestFilterOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterInEnumPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(value: string, metadata: ArgumentMetadata): Promise<Record<string, any>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value,
        }
      }

      const finalValue: T[] = value
        ? (value
            .split(',')
            .map((val: string) => defaultEnum[val])
            .filter((val: string) => val) as T[])
        : (defaultValue as T[])

      this.addToRequestInstance(finalValue)
      return {
        [field]: finalValue.length === 1 ? finalValue[0] : { in: finalValue },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterInEnumPipe)
}

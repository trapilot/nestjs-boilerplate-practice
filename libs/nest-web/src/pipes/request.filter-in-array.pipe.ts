import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp, StrUtil } from 'lib/nest-core'
import { IRequestFilterEqualOptions } from '../interfaces'

export function RequestFilterInArrayPipe<T>(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterInEnumPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(value: string, _metadata: ArgumentMetadata): Promise<Record<string, any>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value,
        }
      }

      const finalValue: T[] = (value || '')
        .split(',')
        .map((val: string) => val.trim())
        .filter((val: string) => val)
        .map((val: string) => StrUtil.parse<T>(val, options))

      this.addToRequestInstance(finalValue)
      return {
        [field]: finalValue.length == 1 ? finalValue[0] : { in: finalValue },
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

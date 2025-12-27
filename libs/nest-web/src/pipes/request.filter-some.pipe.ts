import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp, StrUtil } from 'lib/nest-core'
import { IRequestFilterEqualOptions } from '../interfaces'

export function RequestFilterSomePipe(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterSomePipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(value: string, _metadata: ArgumentMetadata): Promise<Record<string, any>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          some: { [field]: value },
        }
      }

      const finalValue = StrUtil.parse(value, options)

      this.addToRequestInstance(finalValue)
      return {
        some: { [field]: finalValue },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterSomePipe)
}

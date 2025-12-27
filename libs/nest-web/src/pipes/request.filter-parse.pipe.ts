import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp, StrUtil } from 'lib/nest-core'
import { IRequestFilterParseOptions } from '../interfaces'

export function RequestFilterParsePipe(
  field: string,
  options?: IRequestFilterParseOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterParsePipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(value: string, _metadata: ArgumentMetadata): Promise<string> {
      if (options?.raw) {
        this.addToRequestInstance(value)
        return value
      }

      const finalValue = StrUtil.parse(value, options)

      this.addToRequestInstance(finalValue)
      return finalValue
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterParsePipe)
}

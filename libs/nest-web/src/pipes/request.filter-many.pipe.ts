import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp, NestHelper } from 'lib/nest-core'
import { IRequestFilterEqualOptions } from '../interfaces'

export function RequestFilterManyPipe(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterManyPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(value: string, metadata: ArgumentMetadata): Promise<Record<string, any>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: { some: value },
        }
      }

      const finalValue = NestHelper.parse(value, options)

      this.addToRequestInstance(finalValue)
      return {
        [field]: { some: finalValue },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterManyPipe)
}

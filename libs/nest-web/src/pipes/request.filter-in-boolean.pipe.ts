import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { HelperArrayService, IRequestApp } from 'lib/nest-core'
import { IRequestFilterOptions } from '../interfaces'

export function RequestFilterInBooleanPipe(
  field: string,
  defaultValue: boolean[],
  options?: IRequestFilterOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterInBooleanPipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly helperArrayService: HelperArrayService,
    ) {}

    async transform(value: string, metadata: ArgumentMetadata): Promise<Record<string, any>> {
      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value,
        }
      }

      const finalValue: boolean[] =
        value && typeof value === 'string'
          ? this.helperArrayService.unique(value.split(',').map((val: string) => val === 'true'))
          : defaultValue

      if (finalValue.length === 2) {
        return undefined
      }

      this.addToRequestInstance(finalValue[0])
      return {
        [field]: finalValue[0],
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterInBooleanPipe)
}

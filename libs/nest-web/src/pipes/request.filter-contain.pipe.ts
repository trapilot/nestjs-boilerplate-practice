import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp } from 'lib/nest-core'
import { IRequestFilterOptions } from '../interfaces'

export function RequestFilterContainPipe(
  field: string,
  options?: IRequestFilterOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterContainPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(value: string, metadata: ArgumentMetadata): Promise<Record<string, any>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: { contains: value },
        }
      }

      value = `${value}`.trim()

      this.addToRequestInstance(value)
      return {
        [field]: { contains: value },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterContainPipe)
}

import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { ValidationError } from 'class-validator'
import { ArrUtil, IRequestApp, StrUtil } from 'lib/nest-core'
import { ValidateException } from '../exceptions'
import { IRequestFilterEqualOptions } from '../interfaces'

export function RequestFilterBetweenPipe(
  field: string,
  options?: IRequestFilterEqualOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterBetweenPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: string,
      metadata: ArgumentMetadata,
    ): Promise<Record<string, { gte: string | number; lte: string | number }>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.parseAs === 'number') {
        const regex = /^\d+-\d+$/
        if (!regex.test(value)) {
          const error = new ValidationError()
          error.target = metadata.metatype
          error.property = metadata.data
          error.value = value
          error.constraints = { IsPipeBetween: '' }

          throw new ValidateException([error])
        }
      }

      const [min, max] = StrUtil.split(value, { delimiter: '-' })
      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: { gte: min, lte: max || min },
        }
      }

      const finalMin = StrUtil.parse(min, { parseAs: 'number' })
      const finalMax = StrUtil.parse(max, { parseAs: 'number', errorAs: min })

      this.addToRequestInstance(ArrUtil.join([finalMin, finalMax], { delimiter: '-' }))
      return {
        [field]: { gte: finalMin, lte: finalMax },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterBetweenPipe)
}

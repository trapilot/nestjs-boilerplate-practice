import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { DateService, IRequestApp } from 'lib/nest-core'
import { IRequestFilterDateOptions } from '../interfaces'

export function RequestFilterDatePipe(
  field: string,
  options?: IRequestFilterDateOptions,
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinRequestFilterDatePipe implements PipeTransform {
    constructor(
      @Inject(REQUEST) protected readonly request: IRequestApp,
      private readonly dateService: DateService,
    ) {}

    async transform(
      value: string,
      _metadata: ArgumentMetadata,
    ): Promise<Record<string, string | { gte: Date; lte: Date }>> {
      if (!value || typeof value !== 'string') {
        return undefined
      }

      if (options?.raw) {
        this.addToRequestInstance(value)
        return {
          [field]: value,
        }
      }

      const startOfDay = this.dateService.createFromIso(value, { startOfDay: true })
      const endOfDay = this.dateService.createFromIso(value, { endOfDay: true })

      this.addToRequestInstance(value)
      return {
        [field]: {
          gte: startOfDay,
          lte: endOfDay,
        },
      }
    }

    addToRequestInstance(value: any): void {
      this.request.__filters = {
        ...this.request.__filters,
        [field]: value,
      }
    }
  }

  return mixin(MixinRequestFilterDatePipe)
}

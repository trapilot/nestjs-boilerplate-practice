import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp } from 'lib/nest-core'
import { ENUM_REQUEST_ORDER_DIRECTION_TYPE } from '../enums'

export function RequestFilterOrderPipe(
  defaultOrderBy: string,
  availableOrderBy: string[] = [],
): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinFilterOrderPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: Record<string, any>,
      metadata: ArgumentMetadata,
    ): Promise<Record<string, any>> {
      if (availableOrderBy.length === 0) return value

      const orderBy: string[] = this.orderBy(value?.orderBy, defaultOrderBy)

      this.addToRequestInstance(value?.orderBy, availableOrderBy)
      return {
        ...value,
        _params: Object.assign({}, value?._params ?? {}, {
          orderBy: orderBy.map((order) => {
            const [sortKey, sortDir] = order.split(':')
            return { [sortKey]: sortDir }
          }),
        }),
      }
    }

    orderBy(value: string, defaultOrderBy: string): string[] {
      const values = (value || defaultOrderBy).split('|')

      return values
        .filter((v: string) => {
          const [sortKey, _] = (v || '').split(':')
          return availableOrderBy.includes(sortKey)
        })
        .map((v: string) => {
          const [sortKey, sortDir] = v.split(':')
          if (sortDir && sortDir.toLowerCase() === ENUM_REQUEST_ORDER_DIRECTION_TYPE.DESC) {
            return `${sortKey}:${ENUM_REQUEST_ORDER_DIRECTION_TYPE.DESC}`
          }
          return `${sortKey}:${ENUM_REQUEST_ORDER_DIRECTION_TYPE.ASC}`
        })
    }

    addToRequestInstance(orderBy: string, availableOrderBy: string[]): void {
      this.request.__filters = {
        ...this.request.__filters,
        orderBy,
        availableOrderBy,
      }
    }
  }

  return mixin(MixinFilterOrderPipe)
}

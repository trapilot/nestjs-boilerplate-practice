import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp } from 'lib/nest-core'

export function RequestFilterSearchPipe(availableSearch: string[] = []): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinFilterSearchPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: Record<string, any>,
      _metadata: ArgumentMetadata,
    ): Promise<Record<string, any>> {
      if (availableSearch.length === 0) return value

      const search = this.search(value?.search, availableSearch)

      this.addToRequestInstance(value?.search, availableSearch)
      return {
        ...value,
        _search: search,
        _availableSearch: availableSearch,
      }
    }

    addToRequestInstance(search: string, availableSearch: string[]): void {
      this.request.__filters = {
        ...this.request.__filters,
        search,
        availableSearch,
      }
    }

    search(searchValue: string, availableSearch: string[]): Record<string, any> | undefined {
      if (availableSearch.length === 0 || !searchValue) {
        return undefined
      }

      if (availableSearch.length == 1) {
        return { [availableSearch[0]]: { contains: searchValue } }
      }

      return {
        OR: availableSearch.map((field) => {
          return { [field]: { contains: searchValue } }
        }),
      }
    }
  }

  return mixin(MixinFilterSearchPipe)
}

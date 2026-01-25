import { Inject, Injectable, mixin, Type } from '@nestjs/common'
import { ArgumentMetadata, PipeTransform, Scope } from '@nestjs/common/interfaces'
import { REQUEST } from '@nestjs/core'
import { IRequestApp } from 'lib/nest-core'
import {
  REQUEST_DEFAULT_MAX_PER_PAGE,
  REQUEST_DEFAULT_PAGE,
  REQUEST_DEFAULT_PER_PAGE,
} from '../constants'

export function RequestFilterPagingPipe(defaultPerPage: number = 0): Type<PipeTransform> {
  @Injectable({ scope: Scope.REQUEST })
  class MixinFilterPagingPipe implements PipeTransform {
    constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

    async transform(
      value: Record<string, any>,
      _metadata: ArgumentMetadata,
    ): Promise<Record<string, any>> {
      if (defaultPerPage <= 0) return value

      const page: number = this.page(value?.page ? Number.parseInt(value?.page) : 1)
      const perPage: number = this.perPage(Number.parseInt(value?.perPage ?? defaultPerPage))
      const offset: number = this.offset(page, perPage)

      this.addToRequestInstance(page, perPage)
      return {
        ...value,
        _params: Object.assign({}, value?._params ?? {}, {
          take: perPage,
          skip: offset,
        }),
      }
    }

    addToRequestInstance(page: number, perPage: number): void {
      this.request.__pagination = {
        ...this.request.__pagination,
        page,
        perPage,
      }
    }

    private offset(page: number, perPage: number): number {
      perPage = perPage > REQUEST_DEFAULT_PER_PAGE ? REQUEST_DEFAULT_PER_PAGE : perPage
      const offset: number = (page - 1) * perPage

      return offset
    }

    private totalPage(totalData: number, perPage: number): number {
      let totalPage = perPage ? Math.ceil(totalData / perPage) : 0
      totalPage = totalPage === 0 ? 1 : totalPage
      return totalPage
    }

    private offsetWithoutMax(page: number, perPage: number): number {
      const offset: number = (page - 1) * perPage
      return offset
    }

    private totalPageWithoutMax(totalData: number, perPage: number): number {
      let totalPage = perPage ? Math.ceil(totalData / perPage) : 0
      totalPage = totalPage === 0 ? 1 : totalPage
      return totalPage
    }

    private page(page?: number): number {
      return page ? page : REQUEST_DEFAULT_PAGE
    }

    private perPage(perPage?: number): number {
      return perPage
        ? perPage > REQUEST_DEFAULT_MAX_PER_PAGE
          ? REQUEST_DEFAULT_MAX_PER_PAGE
          : perPage
        : REQUEST_DEFAULT_MAX_PER_PAGE
    }
  }

  return mixin(MixinFilterPagingPipe)
}

import {
  applyDecorators,
  Body,
  Ip,
  Param,
  PipeTransform,
  Query,
  Req,
  Res,
  ResponseDecoratorOptions,
  SetMetadata,
  Type,
} from '@nestjs/common'
import { ClassConstructor } from 'class-transformer'
import { REQUEST_PARAM_CLASS_DTO_METADATA } from '../constants'
import {
  IRequestFilterDateOptions,
  IRequestFilterEnumOptions,
  IRequestFilterEqualOptions,
  IRequestFilterOptions,
  IRequestFilterParseOptions,
  IRequestQueryListOptions,
} from '../interfaces'
import {
  RequestFilterBetweenPipe,
  RequestFilterContainPipe,
  RequestFilterDatePipe,
  RequestFilterEqualPipe,
  RequestFilterGreaterThanEqualPipe,
  RequestFilterInArrayPipe,
  RequestFilterInBooleanPipe,
  RequestFilterInEnumPipe,
  RequestFilterLessThanEqualPipe,
  RequestFilterManyPipe,
  RequestFilterOrderPipe,
  RequestFilterPagingPipe,
  RequestFilterParsePipe,
  RequestFilterSearchPipe,
  RequestFilterSomePipe,
} from '../pipes'

export function RequestUserIp(): ParameterDecorator {
  return Ip()
}

export function RequestParamGuard(...classValidation: ClassConstructor<any>[]): MethodDecorator {
  return applyDecorators(SetMetadata(REQUEST_PARAM_CLASS_DTO_METADATA, classValidation))
}

export function RequestQuery(
  field: string,
  options?: IRequestFilterParseOptions,
): ParameterDecorator {
  const pipes = options?.pipes ?? []
  return Query(field, RequestFilterParsePipe(field, options), ...pipes)
}

export function RequestParam(
  field: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return Param(field, ...pipes)
}

export function RequestBody(
  field?: string,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
): ParameterDecorator {
  return Body(field, ...pipes)
}

export function RequestApp(): ParameterDecorator {
  return Req()
}

export function ResponseApp(options?: ResponseDecoratorOptions): ParameterDecorator {
  return Res({ passthrough: true, ...options })
}

//! Request query filter boolean will convert into repository query
export function RequestQueryFilterInBoolean(
  field: string,
  defaultValue?: boolean,
  options?: IRequestFilterOptions,
): ParameterDecorator {
  return Query(
    field,
    RequestFilterInBooleanPipe(
      options?.queryField ?? field,
      [true, false].includes(defaultValue) ? [defaultValue] : [true, false],
      options,
    ),
  )
}

//! Request query filter enum will convert into repository
export function RequestQueryFilterInEnum<T>(
  field: string,
  defaultEnum: Record<string, any>,
  options?: IRequestFilterEnumOptions,
): ParameterDecorator {
  return Query(
    field,
    RequestFilterInEnumPipe<T>(
      options?.queryField ?? field,
      defaultEnum,
      options?.defaultValue ?? (defaultEnum as T),
      options,
    ),
  )
}

//! Request query filter equal will convert into repository
export function RequestQueryFilterEqual(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterEqualPipe(options?.queryField ?? field, options))
}

//! Request query filter greater than equal will convert into repository
export function RequestQueryFilterGreaterThanEqual(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterGreaterThanEqualPipe(options?.queryField ?? field, options))
}

//! Request query filter less than equal will convert into repository
export function RequestQueryFilterLowerThanEqual(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterLessThanEqualPipe(options?.queryField ?? field, options))
}

//! Request query filter equal will convert into repository
export function RequestQueryFilterBetween(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterBetweenPipe(options?.queryField ?? field, options))
}

//! Request query filter in convert into repository
export function RequestQueryFilterInArray(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterInArrayPipe(options?.queryField ?? field, options))
}

//! Request query filter string contain will convert into repository
export function RequestQueryFilterContain(
  field: string,
  options?: IRequestFilterOptions,
): ParameterDecorator {
  return Query(field, RequestFilterContainPipe(options?.queryField ?? field, options))
}

//! Request query filter string contain will convert into repository
export function RequestQueryFilterSome(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterSomePipe(options?.queryField ?? field, options))
}

//! Request query filter string contain will convert into repository
export function RequestQueryFilterMany(
  field: string,
  options?: IRequestFilterEqualOptions,
): ParameterDecorator {
  return Query(field, RequestFilterManyPipe(options?.queryField ?? field, options))
}

//! Request query filter date will convert into repository
export function RequestQueryFilterDate(
  field: string,
  options?: IRequestFilterDateOptions,
): ParameterDecorator {
  return Query(field, RequestFilterDatePipe(options?.queryField ?? field, options))
}

//! Request query filter list helper
export function RequestQueryList(options?: IRequestQueryListOptions): ParameterDecorator {
  return Query(
    RequestFilterSearchPipe(options?.availableSearch),
    RequestFilterOrderPipe(
      options?.defaultOrderBy,
      options?.availableOrderBy
        ? options.availableOrderBy
        : options?.defaultOrderBy
          ? options.defaultOrderBy.split('|').map((ord) => ord.split(':')[0])
          : [],
    ),
    RequestFilterPagingPipe(options?.defaultPerPage),
  )
}

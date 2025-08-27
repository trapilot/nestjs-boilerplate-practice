import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class RequestListDto {
  _search: Record<string, any>
  _params: {
    take: number
    skip: number
    cursor: Record<string, number>
    orderBy: Record<string, 'asc' | 'desc'>[]
  }
  _availableSearch: string[]
  _availableOrderBy: string[]

  @IsOptional()
  @IsString()
  @Type(() => String)
  search: string

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  perPage: number

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number

  @IsOptional()
  @IsString()
  @Type(() => String)
  orderBy: string
}

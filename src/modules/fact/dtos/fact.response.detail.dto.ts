import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ENUM_AUTH_LOGIN_FROM } from 'lib/nest-auth'
import { ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { ENUM_FACT_TYPE } from '../enums'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => ResponseLocaleDto)
  @Expose()
  title: any

  @Type(() => ResponseLocaleDto)
  @Expose()
  content: any

  @Type(() => String)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  type: ENUM_FACT_TYPE | null

  @Type(() => Number)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  sorting: number

  @Type(() => Boolean)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  isActive: boolean

  @Type(() => Date)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  createdAt: Date

  @Type(() => Date)
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS] })
  updatedAt: Date

  @ToUrl()
  @Expose()
  thumbnail: string
}

export class FactResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseUserBelongDto,
) {}

export class FactResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, ['thumbnail'] as const),
  ResponseUserBelongDto,
) {}

export class FactResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'title', 'isActive'] as const),
  ResponseUserBelongDto,
) {}

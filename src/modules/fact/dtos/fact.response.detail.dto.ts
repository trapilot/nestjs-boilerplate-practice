import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { EnumAuthLoginFrom } from 'lib/nest-auth'
import { ToUrl } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'
import { EnumFactType } from '../enums'

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
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  type: EnumFactType | null

  @Type(() => Number)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  sorting: number

  @Type(() => Boolean)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  isActive: boolean

  @Type(() => Date)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
  createdAt: Date

  @Type(() => Date)
  @Expose({ groups: [EnumAuthLoginFrom.CMS] })
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
  OmitType(ResponseDataDetailDto, ['content', 'thumbnail'] as const),
  ResponseUserBelongDto,
) {}

export class FactResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'title', 'isActive'] as const),
  ResponseUserBelongDto,
) {}

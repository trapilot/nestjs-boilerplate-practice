import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { MemberResponseBelongDto } from 'modules/member/dtos/member.response.detail.dto'
import { ToCartPoint, ToCartPrice, ToShipment } from '../transforms/cart.transform'
import { CartItemResponseDetailDto } from './cart.response.item.dto'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  // @ApiProperty({ example: null })
  // @Type(() => Number)
  // @Expose()
  // promotionId: number

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  version: number

  @ApiProperty({ example: '0' })
  @ToCartPrice()
  @Expose()
  finalPrice: string

  @ApiProperty({ example: '0' })
  @ToCartPoint()
  @Expose()
  finalPoint: string

  @ApiProperty({ example: false })
  @ToShipment()
  @Expose()
  hasShipment: boolean

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ApiProperty({ type: () => MemberResponseBelongDto })
  @Type(() => MemberResponseBelongDto)
  @Expose()
  member: MemberResponseBelongDto

  @ApiProperty({ type: () => CartItemResponseDetailDto })
  @Type(() => CartItemResponseDetailDto)
  @Expose()
  items: CartItemResponseDetailDto[]
}

export class CartResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class CartResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class CartResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}

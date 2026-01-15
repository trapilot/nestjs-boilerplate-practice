import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: new Date(Date.now - 20000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now - 1000 * 3600) })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
}

export class <%= singular(classify(name)) %>ResponseDetailDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class <%= singular(classify(name)) %>ResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class <%= singular(classify(name)) %>ResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}

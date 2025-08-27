import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseLocaleDto, ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ type: ResponseLocaleDto })
  @Type(() => ResponseLocaleDto)
  @Expose()
  name: ResponseLocaleDto

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({ example: faker.date.past() })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: faker.date.recent() })
  @ToDate()
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {}

export class ProductCategoryResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class ProductCategoryResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class ProductCategoryResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'name', 'isActive'] as const),
  ResponseDataRelationDto,
) {}

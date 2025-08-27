import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_APP_VERSION_PLATFORM } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ enum: ENUM_APP_VERSION_PLATFORM, example: ENUM_APP_VERSION_PLATFORM.IOS })
  @Type(() => String)
  @Expose()
  type: string

  @ApiProperty({ example: 'Api version name' })
  @Type(() => String)
  @Expose()
  name: string

  @ApiProperty({ example: '0.0.1' })
  @Type(() => String)
  @Expose()
  version: string

  @ApiProperty({ example: faker.internet.url() })
  @Type(() => String)
  @Expose()
  url: string

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @Expose()
  isForce: boolean

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

export class AppVersionResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class AppVersionResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class AppVersionResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}

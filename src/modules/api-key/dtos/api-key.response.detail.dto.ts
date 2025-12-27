import { faker } from '@faker-js/faker'
import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { ENUM_API_KEY_TYPE } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: faker.number.int({ min: 1, max: 10 }) })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({
    description: 'Type of api key',
    example: ENUM_API_KEY_TYPE.CLIENT,
    enum: ENUM_API_KEY_TYPE,
    required: true,
  })
  @Type(() => String)
  type: ENUM_API_KEY_TYPE

  @ApiProperty({
    description: 'Alias name of api key',
    example: faker.person.jobTitle(),
    required: true,
  })
  @Type(() => String)
  @Expose()
  name: string

  @ApiProperty({
    description: 'Unique key of api key',
    example: faker.string.alpha(15),
    required: true,
  })
  @Type(() => String)
  @Expose()
  key: string

  @ApiProperty({
    description: 'Hash key of api key',
    example: faker.string.alpha(32),
    required: true,
  })
  @Type(() => String)
  @Expose()
  hash: string

  @ApiProperty({ example: false })
  @Type(() => Boolean)
  @Expose()
  isDeprecated: boolean

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @ApiProperty({
    description: 'Api Key start date',
    example: faker.date.past(),
    required: false,
  })
  @ToDate()
  @Expose()
  startDate: Date

  @ApiProperty({
    description: 'Api Key end date',
    example: faker.date.future(),
    required: false,
  })
  @ToDate()
  @Expose()
  untilDate: Date

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

export class ApiKeyResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class ApiKeyResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class ApiKeyResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto,
) {}

import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumApiKeyType } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({
    description: 'Type of api key',
    example: EnumApiKeyType.CLIENT,
    enum: EnumApiKeyType,
    required: true,
  })
  @Type(() => String)
  type: EnumApiKeyType

  @ApiProperty({
    description: 'Alias name of api key',
    example: 'director',
    required: true,
  })
  @Type(() => String)
  @Expose()
  name: string

  @ApiProperty({
    description: 'Unique key of api key',
    example: 'asdjdh12z3asdas1s12dw2',
    required: true,
  })
  @Type(() => String)
  @Expose()
  key: string

  @ApiProperty({
    description: 'Hash key of api key',
    example: 'asdjdh12z3asdas1s12dmxjxhhfrprh3URYNESAGw2',
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
    example: new Date(Date.now() - 1000 * 3600),
    required: false,
  })
  @ToDate()
  @Expose()
  startDate: Date

  @ApiProperty({
    description: 'Api Key end date',
    example: new Date(Date.now() + 30000 * 3600),
    required: false,
  })
  @ToDate()
  @Expose()
  untilDate: Date

  @ApiProperty({ example: new Date(Date.now() - 30000 * 3600) })
  @ToDate()
  @Expose()
  createdAt: Date

  @ApiProperty({ example: new Date(Date.now() - 1000 * 3600) })
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

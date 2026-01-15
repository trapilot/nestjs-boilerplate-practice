import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { EnumAppVersionPlatform } from '@runtime/prisma-client'
import { Expose, Type } from 'class-transformer'
import { ToDate } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ enum: EnumAppVersionPlatform, example: EnumAppVersionPlatform.IOS })
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

  @ApiProperty({ example: '' })
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

export class AppVersionResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto
) {}

export class AppVersionResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto
) {}

export class AppVersionResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id'] as const),
  ResponseDataRelationDto
) {}

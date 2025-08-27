import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { ToRolePermissions } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @Type(() => String)
  @Expose()
  title: string

  @Type(() => String)
  @Expose()
  description?: string

  @Type(() => Boolean)
  @Expose()
  isActive: boolean

  @Type(() => Date)
  @Expose()
  createdAt: Date

  @Type(() => Date)
  @Expose()
  updatedAt: Date
}

class ResponseDataRelationDto extends ResponseUserBelongDto {
  @ToRolePermissions()
  @Expose()
  permissions: any[]
}

export class RoleResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class RoleResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class RoleResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'title', 'isActive'] as const),
  ResponseDataRelationDto,
) {}

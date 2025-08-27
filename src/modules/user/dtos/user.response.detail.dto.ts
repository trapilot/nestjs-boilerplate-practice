import { ApiProperty, IntersectionType, OmitType, PickType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToUrl } from 'lib/nest-core'
import { ResponseUserBelongDto } from 'lib/nest-web'
import { RoleResponseBelongDto } from 'src/modules/role/dtos'
import { ToUserRoles } from '../transforms'

class ResponseDataDetailDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  email: string

  @Type(() => String)
  @Expose()
  phone: string | null

  @Type(() => String)
  @Expose()
  name: string | null

  @Type(() => String)
  @Expose()
  address: string | null

  @Type(() => String)
  @ToUrl()
  @Expose()
  avatar: string | null

  @Type(() => Date)
  @Expose()
  loginDate: Date | null

  @Type(() => String)
  @Expose()
  signUpFrom: string | null

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
  @ToUserRoles({ flat: true })
  @Expose()
  role: RoleResponseBelongDto
}

export class UserResponseDetailDto extends IntersectionType(
  ResponseDataDetailDto,
  ResponseDataRelationDto,
) {}

export class UserResponseListDto extends IntersectionType(
  OmitType(ResponseDataDetailDto, [] as const),
  ResponseDataRelationDto,
) {}

export class UserResponseBelongDto extends IntersectionType(
  PickType(ResponseDataDetailDto, ['id', 'name'] as const),
  ResponseDataRelationDto,
) {}

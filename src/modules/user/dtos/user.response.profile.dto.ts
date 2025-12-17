import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToUrl } from 'lib/nest-core'
import { IUserProfilePermission } from '../interfaces'
import { ToUserPermissions, ToUserRoles } from '../transforms'

export class ResponseUserProfileDto {
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

  @Type(() => Date)
  @Expose()
  createdAt: Date
}

class ResponseUserProfileRelationDto {
  // @ToUserRoles({ level: true })
  // @Expose()
  // roleLevels: number[]

  @ToUserRoles({ flat: true, key: true })
  @Expose()
  roleId: number

  @ToUserRoles({ flat: true, level: true })
  @Expose()
  roleLv: number

  @ToUserPermissions()
  @Expose()
  permissions: IUserProfilePermission[]
}

export class UserProfileResponseDto extends IntersectionType(
  ResponseUserProfileDto,
  ResponseUserProfileRelationDto,
) {}

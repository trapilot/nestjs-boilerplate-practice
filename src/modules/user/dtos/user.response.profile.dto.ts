import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ToUrl } from 'lib/nest-core'
import { IUserProfilePermission } from '../interfaces/user.auth.interface'
import { ToUserPermissions } from '../transforms/user.permissions.transform'
import { ToUserRoles } from '../transforms/user.roles.transform'

class ResponseUserPermissionSubject {
  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  path: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  title: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  context: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  subject: string

  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  isVisible: boolean

  @ApiProperty({ example: ['read'] })
  @Type(() => String)
  @Expose()
  actions: string[]
}

class ResponseUserPermission {
  @ApiProperty({ example: true })
  @Type(() => Boolean)
  @Expose()
  group: boolean

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  path: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  title: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  context: string

  @ApiProperty({ type: () => [ResponseUserPermissionSubject] })
  @Type(() => ResponseUserPermissionSubject)
  @Expose()
  subjects: ResponseUserPermissionSubject[]
}

export class ResponseUserProfileDto {
  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  email: string

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  phone: string | null

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  name: string | null

  @ApiProperty({ example: '' })
  @Type(() => String)
  @Expose()
  address: string | null

  @ApiProperty({ example: '' })
  @Type(() => String)
  @ToUrl()
  @Expose()
  avatar: string | null

  @ApiProperty({ example: new Date() })
  @Type(() => Date)
  @Expose()
  loginDate: Date | null

  @ApiProperty({ example: new Date() })
  @Type(() => Date)
  @Expose()
  createdAt: Date
}

class ResponseUserProfileRelationDto {
  // @ToUserRoles({ level: true })
  // @Expose()
  // roleLevels: number[]

  @ApiProperty({ example: 1 })
  @ToUserRoles({ flat: true, key: true })
  @Type(() => Number)
  @Expose()
  roleId: number

  @ApiProperty({ example: 1 })
  @ToUserRoles({ flat: true, level: true })
  @Type(() => Number)
  @Expose()
  roleLv: number

  @ApiProperty({ type: () => [ResponseUserPermission] })
  @ToUserPermissions()
  @Expose()
  permissions: IUserProfilePermission[]
}

export class UserProfileResponseDto extends IntersectionType(
  ResponseUserProfileDto,
  ResponseUserProfileRelationDto,
) {}

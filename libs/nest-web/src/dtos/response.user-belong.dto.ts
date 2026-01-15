import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { EnumAuthLoginFrom, EnumAuthScopeType } from 'lib/nest-auth'
import { ResponseUtil } from '../utils'

class UserBelongInfo {
  @ApiProperty({
    description: 'Id that representative with your target data',
    example: 2,
  })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({
    description: 'Name that representative with your target data',
    example: 'nestjs_demo',
  })
  @Type(() => String)
  @Expose()
  name: string
}

export class ResponseUserBelongDto {
  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    if (id === undefined) return id
    return ResponseUtil.mapToInstance(obj?.createdByUser ?? { id, name: '' }, {
      type: UserBelongInfo,
      transform: {},
    })
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  createdBy: UserBelongInfo

  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    if (id === undefined) return id
    return ResponseUtil.mapToInstance(obj?.updatedByUser ?? { id, name: '' }, {
      type: UserBelongInfo,
      transform: {},
    })
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  updatedBy: number | UserBelongInfo

  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    if (id === undefined) return id
    return ResponseUtil.mapToInstance(obj?.deletedByUser ?? { id, name: '' }, {
      type: UserBelongInfo,
      transform: {},
    })
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  deletedBy: UserBelongInfo

  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    if (id === undefined) return id
    return ResponseUtil.mapToInstance(obj?.assignedByUser ?? { id, name: '' }, {
      type: UserBelongInfo,
      transform: {},
    })
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  assignedBy: UserBelongInfo
}

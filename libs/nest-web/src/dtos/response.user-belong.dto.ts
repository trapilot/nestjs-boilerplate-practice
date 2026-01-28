import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { EnumAuthLoginFrom, EnumAuthScopeType } from 'lib/nest-auth'

export class ResponseUserBelongDto {
  @ApiProperty({ type: String })
  @Transform(({ obj, value: id }) => {
    if (obj?.createdByUser) {
      return obj?.createdByUser?.name ?? ''
    }
    return id ? `${id}` : undefined
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  createdBy: string

  @ApiProperty({ type: String })
  @Transform(({ obj, value: id }) => {
    if (obj?.updatedByUser) {
      return obj?.createdByUser?.name ?? ''
    }
    return id ? `${id}` : undefined
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  updatedBy: string

  @ApiProperty({ type: String })
  @Transform(({ obj, value: id }) => {
    if (obj?.updatedByUser) {
      return obj?.deletedByUser?.name ?? ''
    }
    return id ? `${id}` : undefined
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  deletedBy: string

  @ApiProperty({ type: String })
  @Transform(({ obj, value: id }) => {
    if (obj?.updatedByUser) {
      return obj?.assignedByUser?.name ?? ''
    }
    return id ? `${id}` : undefined
  })
  @Expose({ groups: [EnumAuthLoginFrom.CMS, EnumAuthScopeType.USER] })
  assignedBy: string
}

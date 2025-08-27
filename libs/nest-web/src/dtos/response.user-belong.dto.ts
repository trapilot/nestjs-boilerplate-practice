import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type, plainToInstance } from 'class-transformer'
import { ENUM_AUTH_LOGIN_FROM, ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth/enums'

class UserBelongInfo {
  constructor(id: number, name?: string) {
    this.id = id
    this.name = name || ''
  }

  @ApiProperty({
    description: 'Id that representative with your target data',
    example: faker.number.int({ min: 1, max: 100 }),
  })
  @Type(() => Number)
  @Expose()
  id: number

  @ApiProperty({
    description: 'Name that representative with your target data',
    example: faker.internet.username(),
  })
  @Type(() => String)
  @Expose()
  name: string
}

export class ResponseUserBelongDto {
  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    return id === undefined
      ? undefined
      : plainToInstance(UserBelongInfo, obj?.createdByUser ?? new UserBelongInfo(id), {
          excludeExtraneousValues: true,
        })
  })
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS, ENUM_AUTH_SCOPE_TYPE.USER] })
  createdBy: UserBelongInfo

  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    return id === undefined
      ? undefined
      : plainToInstance(UserBelongInfo, obj?.updatedByUser ?? new UserBelongInfo(id), {
          excludeExtraneousValues: true,
        })
  })
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS, ENUM_AUTH_SCOPE_TYPE.USER] })
  updatedBy: number | UserBelongInfo

  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    return id === undefined
      ? undefined
      : plainToInstance(UserBelongInfo, obj?.deletedByUser ?? new UserBelongInfo(id), {
          excludeExtraneousValues: true,
        })
  })
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS, ENUM_AUTH_SCOPE_TYPE.USER] })
  deletedBy: UserBelongInfo

  @ApiProperty({ type: UserBelongInfo })
  @Transform(({ obj, value: id }) => {
    return id === undefined
      ? undefined
      : plainToInstance(UserBelongInfo, obj?.assignedByUser ?? new UserBelongInfo(id), {
          excludeExtraneousValues: true,
        })
  })
  @Expose({ groups: [ENUM_AUTH_LOGIN_FROM.CMS, ENUM_AUTH_SCOPE_TYPE.USER] })
  assignedBy: UserBelongInfo
}

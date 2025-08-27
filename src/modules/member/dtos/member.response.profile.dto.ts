import { OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ResponseLocaleDto } from 'lib/nest-web'
import { MemberResponseDetailDto } from './member.response.detail.dto'

export class MemberProfileResponseDto extends OmitType(MemberResponseDetailDto, [] as const) {
  @Type(() => ResponseLocaleDto)
  @Expose()
  messages: ResponseLocaleDto[]
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { AuthTokenResponseDto } from 'lib/nest-auth'
import { MemberResponseTwoFactorDto } from './member.response.two-factor.dto'

export class MemberResponseLoginDto {
  @ApiProperty({
    description: 'Indicates whether an additional 2FA verification step is enable',
    example: false,
    required: true,
  })
  @Expose()
  isTwoFactorEnable: boolean

  @ApiProperty({
    required: false,
    type: AuthTokenResponseDto,
    description: 'Provides access and refresh tokens upon successful login',
  })
  @Type(() => AuthTokenResponseDto)
  @Expose()
  token?: AuthTokenResponseDto

  @ApiProperty({
    required: false,
    type: MemberResponseTwoFactorDto,
    description: 'Provides details for completing the 2FA verification step',
  })
  @Type(() => MemberResponseTwoFactorDto)
  @Expose()
  twoFactor?: MemberResponseTwoFactorDto
}

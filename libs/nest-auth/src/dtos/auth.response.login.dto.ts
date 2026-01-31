import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { AuthResponseTwoFactorDto } from './auth.response.two-factor.dto'
import { AuthTokenResponseDto } from './auth.token.response.dto'

export class AuthResponseLoginDto {
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
    type: AuthResponseTwoFactorDto,
    description: 'Provides details for completing the 2FA verification step',
  })
  @Type(() => AuthResponseTwoFactorDto)
  @Expose()
  twoFactor?: AuthResponseTwoFactorDto
}

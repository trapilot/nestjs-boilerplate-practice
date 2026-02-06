import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { AuthResponseTokenDto, AuthResponseTwoFactorDto } from 'lib/nest-auth'

export class UserResponseLoginDto {
  @ApiProperty({
    description: 'Indicates whether an additional 2FA verification step is enable',
    example: false,
    required: true,
  })
  @Expose()
  isTwoFactorEnable: boolean

  @ApiProperty({
    required: false,
    type: AuthResponseTokenDto,
    description: 'Provides access and refresh tokens upon successful login',
  })
  @Type(() => AuthResponseTokenDto)
  @Expose()
  token?: AuthResponseTokenDto

  @ApiProperty({
    required: false,
    type: AuthResponseTwoFactorDto,
    description: 'Provides details for completing the 2FA verification step',
  })
  @Type(() => AuthResponseTwoFactorDto)
  @Expose()
  twoFactor?: AuthResponseTwoFactorDto
}

import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class AuthResponseTwoFactorDto {
  @ApiProperty({
    description: 'Indicates whether the user is required to set up 2FA upon next login',
    example: false,
    required: true,
  })
  @Expose()
  isRequiredSetup: boolean

  @ApiProperty({
    required: true,
    description: 'Challenge token to be used for completing 2FA login',
    example: '2b5b8933f0a44a94b3e1a96f8d2e2f21',
  })
  @Expose()
  challengeToken: string

  @ApiProperty({
    required: true,
    description: 'Challenge token TTL in milliseconds',
    example: 300,
  })
  @Expose()
  challengeExpiresInMs: number

  @ApiProperty({
    required: false,
    description: 'Remaining backup codes count for the account',
    example: 8,
  })
  @Expose()
  backupCodesRemaining?: number
}

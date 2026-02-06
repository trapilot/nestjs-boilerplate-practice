import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

export class AuthResponseTokenDto {
  @ApiProperty({ example: 'Bearer' })
  @Type(() => String)
  @Expose()
  tokenType: string

  @ApiProperty({ example: 1660190937231, description: 'Expire in timestamp' })
  @Type(() => Number)
  @Expose()
  expiresIn: number

  @ApiProperty({ example: 1660190937231, description: 'Expire in timestamp' })
  @Type(() => Number)
  @Expose()
  refreshIn: number

  @ApiProperty({
    example: 'asjdgh124123jl213aazs',
    description: 'Will be valid JWT Encode string',
  })
  @Type(() => String)
  @Expose()
  accessToken: string

  @ApiProperty({
    example: '1iu3ijk23jihyuiasduiasd783y43h4',
    description: 'Will be valid JWT Encode string',
  })
  @Type(() => String)
  @Expose()
  refreshToken: string
}

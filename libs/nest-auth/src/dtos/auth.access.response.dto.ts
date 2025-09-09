import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'

export class AuthAccessResponseDto {
  @ApiProperty({ example: 'Bearer' })
  @Type(() => String)
  @Expose()
  tokenType: string

  @ApiProperty({ example: 1660190937231, description: 'Expire in timestamp' })
  @Type(() => Number)
  @Expose()
  expiresIn: number

  @ApiProperty({
    example: faker.string.alphanumeric(30),
    description: 'Will be valid JWT Encode string',
  })
  @Type(() => String)
  @Expose()
  accessToken: string

  @ApiProperty({
    example: faker.string.alphanumeric(30),
    description: 'Will be valid JWT Encode string',
  })
  @Type(() => String)
  @Expose()
  refreshToken: string
}

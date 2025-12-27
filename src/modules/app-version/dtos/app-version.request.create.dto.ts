import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import { ENUM_APP_VERSION_PLATFORM } from '@runtime/prisma-client'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ToString } from 'lib/nest-core'

export class AppVersionRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(ENUM_APP_VERSION_PLATFORM)
  @ApiProperty({
    description: 'Api Key name',
    example: ENUM_APP_VERSION_PLATFORM.AOS,
    required: true,
    enum: ENUM_APP_VERSION_PLATFORM,
  })
  type: ENUM_APP_VERSION_PLATFORM

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Api version name',
    example: ENUM_APP_VERSION_PLATFORM.AOS,
    required: true,
  })
  name: string

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MaxLength(10)
  @ApiProperty({
    description: 'Api version number',
    example: '0.0.1',
    required: true,
  })
  version: string

  @IsOptional()
  @IsString()
  @ToString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Api share link',
    example: faker.internet.url(),
    required: true,
  })
  url: string
}

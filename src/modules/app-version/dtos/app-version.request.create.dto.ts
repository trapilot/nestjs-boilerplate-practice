import { ApiProperty } from '@nestjs/swagger'
import { EnumAppVersionPlatform } from '@runtime/prisma-client'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ToString } from 'lib/nest-core'

export class AppVersionRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumAppVersionPlatform)
  @ApiProperty({
    description: 'Api Key name',
    example: EnumAppVersionPlatform.AOS,
    required: true,
    enum: EnumAppVersionPlatform,
  })
  type: EnumAppVersionPlatform

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Api version name',
    example: EnumAppVersionPlatform.AOS,
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
    required: true,
  })
  url: string
}

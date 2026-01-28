import { ApiProperty } from '@nestjs/swagger'
import { EnumPlatformType } from '@runtime/prisma-client'
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { ToString } from 'lib/nest-core'

export class AppVersionRequestCreateDto {
  @IsNotEmpty()
  @IsEnum(EnumPlatformType)
  @ApiProperty({
    description: 'Api Key name',
    example: EnumPlatformType.AOS,
    required: true,
    enum: EnumPlatformType,
    enumName: 'EnumPlatformType',
  })
  type: EnumPlatformType

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MaxLength(100)
  @ApiProperty({
    description: 'Api version name',
    example: EnumPlatformType.AOS,
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

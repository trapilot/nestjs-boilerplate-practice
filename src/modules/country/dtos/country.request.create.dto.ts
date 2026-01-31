import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { APP_TIMEZONE, EnumCountryCode, ToBoolean } from 'lib/nest-core'

export class CountryRequestCreateDto {
  @ApiProperty({
    required: true,
    description: 'Country name',
    maxLength: 100,
    minLength: 1,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  @MinLength(1)
  name: string

  @ApiProperty({
    required: true,
    description: 'Country code, Alpha 2 code version',
    maxLength: 2,
    minLength: 2,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2)
  @MinLength(2)
  @Transform(({ value }) => value.toUpperCase())
  alpha2Code: string

  @ApiProperty({
    required: true,
    description: 'Country code, Alpha 3 code version',
    maxLength: 3,
    minLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  @MinLength(3)
  @Transform(({ value }) => value.toUpperCase())
  alpha3Code: string

  @ApiProperty({
    required: true,
    description: 'Country phone code',
    maxLength: 4,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsString({ each: true })
  @MaxLength(4, { each: true })
  phoneCode: string[]

  @ApiProperty({
    required: true,
    example: EnumCountryCode.AD,
  })
  @IsNotEmpty()
  @IsString()
  continent: string

  @ApiProperty({
    required: true,
    example: APP_TIMEZONE,
  })
  @IsNotEmpty()
  @IsString()
  timezone: string

  @IsNotEmpty()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean
}

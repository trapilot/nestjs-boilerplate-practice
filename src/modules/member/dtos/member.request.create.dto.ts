import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'
import { EnumAppLanguage, ToBoolean, ToString } from 'lib/nest-core'
import { IsPassword, IsPhone } from 'lib/nest-web'

export class MemberRequestCreateDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: 'Payx' })
  name: string

  @IsNotEmpty()
  @IsPhone()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PHONE })
  phone: string

  @IsOptional()
  @IsEmail()
  @ToString()
  @ApiProperty({ required: false, example: process.env.MOCK_MEMBER_EMAIL })
  email: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: false, example: process.env.MOCK_MEMBER_CARD })
  citizenId: string

  @IsOptional()
  @IsString()
  @ToString()
  @MaxLength(255)
  @ApiProperty({ required: false, example: 'home #01' })
  address: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({
    required: false,
    example: new Date(Date.now() - 37 * 12 * 30000 * 3600),
  })
  birthDate: Date

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  avatar: string

  @IsOptional()
  @IsEnum(EnumAppLanguage)
  @ToString()
  @ApiProperty({
    required: false,
    enum: EnumAppLanguage,
    enumName: 'EnumAppLanguage',
    example: EnumAppLanguage.EN,
  })
  locale: string

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean

  @IsNotEmpty()
  @IsPassword()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_MEMBER_PASS })
  password: string
}

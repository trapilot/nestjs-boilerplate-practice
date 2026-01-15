import { faker } from '@faker-js/faker'
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
  @ApiProperty({ required: true, example: faker.person.lastName() })
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
  cardId: string

  @IsOptional()
  @IsString()
  @ToString()
  @MaxLength(255)
  @ApiProperty({ required: false, example: faker.location.streetAddress(true) })
  address: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({
    required: false,
    example: faker.date.birthdate({ mode: 'age', min: 20, max: 70 }),
  })
  birthDate: Date

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  avatar: string

  @IsOptional()
  @IsEnum(EnumAppLanguage)
  @ToString()
  @ApiProperty({ required: false, enum: EnumAppLanguage, example: EnumAppLanguage.EN })
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

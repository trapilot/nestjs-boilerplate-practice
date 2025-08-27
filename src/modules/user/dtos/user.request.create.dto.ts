import { faker } from '@faker-js/faker'
import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'
import { ToBoolean, ToNumber, ToString } from 'lib/nest-core'
import { IsPassword, IsPhone } from 'lib/nest-web'

export class UserRequestCreateDto {
  @IsNotEmpty()
  @IsEmail()
  @ToString()
  @MaxLength(100)
  @ApiProperty({ required: true, example: process.env.MOCK_USER_EMAIL })
  email: string

  @IsNotEmpty()
  @IsPhone()
  @ToString()
  @ApiProperty({ required: false, example: process.env.MOCK_USER_PHONE })
  phone: string

  @IsNotEmpty()
  @IsString()
  @ToString()
  @MinLength(1)
  @MaxLength(30)
  @ApiProperty({ required: true, example: faker.person.lastName() })
  name: string

  @IsOptional()
  @IsString()
  @ToString()
  @ApiProperty({ required: true, example: faker.location.streetAddress() })
  address: string

  @IsOptional()
  @ApiProperty({ required: false, type: 'string', format: 'binary' })
  avatar: string

  @IsNotEmpty()
  @IsPassword()
  @ToString()
  @ApiProperty({ required: true, example: process.env.MOCK_USER_PASS })
  password: string

  @IsOptional()
  @IsBoolean()
  @ToBoolean()
  @ApiProperty({ required: true, example: true })
  isActive: boolean

  @IsNotEmpty()
  @IsNumber()
  @ToNumber()
  @ApiProperty({ required: true, example: 1 })
  roleId: number
}

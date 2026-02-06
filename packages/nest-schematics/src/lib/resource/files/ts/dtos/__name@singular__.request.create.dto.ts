import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { ToEmail, ToPhone, ToString } from 'lib/nest-core'
import { IsEmail, IsPhone } from 'lib/nest-web'

export class <%= singular(classify(name)) %>RequestCreateDto {
  @IsNotEmpty()
  @IsString()
  @ToString()
  @MinLength(1)
  @MaxLength(30)
  @ApiProperty({ required: true, example: 'HOME' })
  name: string

  @IsOptional()
  @IsEmail()
  @ToEmail()
  @ApiProperty({ example: '' })
  email: string

  @IsOptional()
  @IsPhone()
  @ToPhone()
  @ApiProperty({ example: '' })
  phone: string
}

import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { ENUM_APP_ENVIRONMENT } from '../enums'

export class NestEnvDto {
  @IsString()
  @IsNotEmpty()
  APP_NAME: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(ENUM_APP_ENVIRONMENT)
  APP_ENV: ENUM_APP_ENVIRONMENT

  @IsString()
  @IsNotEmpty()
  APP_SECRET_KEY: string

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string
}

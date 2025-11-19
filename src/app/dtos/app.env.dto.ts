import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator'
import { ENUM_APP_ENVIRONMENT } from 'lib/nest-core'

export class AppEnvDto {
  @IsString()
  @IsNotEmpty()
  APP_NAME: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(ENUM_APP_ENVIRONMENT)
  APP_ENV: ENUM_APP_ENVIRONMENT

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  APP_URL: string

  @IsString()
  @IsNotEmpty()
  APP_SECRET_KEY: string

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string
}

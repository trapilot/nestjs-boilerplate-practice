import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator'
import { EnumAppEnvironment } from 'lib/nest-core'

export class AppEnvDto {
  @IsString()
  @IsNotEmpty()
  APP_NAME: string

  @IsString()
  @IsNotEmpty()
  @IsEnum(EnumAppEnvironment)
  APP_ENV: EnumAppEnvironment

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

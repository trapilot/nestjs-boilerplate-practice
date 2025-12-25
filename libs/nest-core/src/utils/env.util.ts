import { APP_ENV } from '../constants'
import { ENUM_APP_ENVIRONMENT } from '../enums'

export class EnvUtil {
  static isEnv(env: ENUM_APP_ENVIRONMENT): boolean {
    return env === (process.env.APP_ENV || APP_ENV)
  }

  static isDevelopment(): boolean {
    return this.isEnv(ENUM_APP_ENVIRONMENT.DEVELOPMENT)
  }

  static isStaging(): boolean {
    return this.isEnv(ENUM_APP_ENVIRONMENT.STAGING)
  }

  static isStable(): boolean {
    return this.isEnv(ENUM_APP_ENVIRONMENT.STABLE)
  }

  static isProduction(): boolean {
    return this.isEnv(ENUM_APP_ENVIRONMENT.PRODUCTION)
  }
}

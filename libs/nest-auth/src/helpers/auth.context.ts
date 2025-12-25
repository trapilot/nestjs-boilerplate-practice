import { IAuthAbilityConfig } from '../interfaces'

export class AuthContext {
  private static config: IAuthAbilityConfig

  static setConfig(config: IAuthAbilityConfig) {
    this.config = config
  }

  static getConfig(): IAuthAbilityConfig {
    if (!this.config) {
      throw new Error('AuthAbilityContext not initialized')
    }
    return this.config
  }
}

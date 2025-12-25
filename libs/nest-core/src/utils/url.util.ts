import { APP_URL } from '../constants'
import { AppContext } from '../contexts'
import { EnvUtil } from './env.util'

export class UrlUtil {
  static getBaseUrl(): string {
    if (EnvUtil.isDevelopment() && AppContext.isAppRequest()) {
      return `http://10.0.2.2:3000`
    }
    return process.env.APP_URL || APP_URL
  }

  static normalize(path: string): string {
    return path.replaceAll('\\', '/')
  }

  static build(path: string, host?: string): string {
    if (!path) return path

    host = host || this.getBaseUrl()
    path = this.normalize(path)

    return `${host}/${path}`
  }
}

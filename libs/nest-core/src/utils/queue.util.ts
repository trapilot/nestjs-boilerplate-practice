import { APP_ENV, APP_NAME } from '../constants'

export class QueueUtil {
  static label(type: string, name: string, prefix: string, appEnv: string): string {
    return `${prefix}-${appEnv ?? APP_ENV}:${name}:${type}`
  }

  static consumer(name: string, appName?: string, appEnv?: string): string {
    return `${appName ?? APP_NAME}-${appEnv ?? APP_ENV}:${name}:consumer`
  }

  static queue(name: string, appName?: string, appEnv?: string): string {
    return `${appName ?? APP_NAME}-${appEnv ?? APP_ENV}:${name}:queue`
  }

  static processor(name: string, appName?: string, appEnv?: string): string {
    return `${appName ?? APP_NAME}-${appEnv ?? APP_ENV}:${name}processor`
  }
}

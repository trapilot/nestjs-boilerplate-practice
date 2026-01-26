import { ConfigurationParameters } from '@onesignal/node-onesignal/dist/configuration'
import { EnumAppEnvironment, EnumAppLanguage, EnumAppTimezone } from '../enums'

export interface IConfigApp {
  env: string | EnumAppEnvironment
  url: string
  web: string
  name: string
  version: string
  timezone: string | EnumAppTimezone
  language: string | EnumAppLanguage
  startDate: Date

  urlVersion: {
    prefix: string
    version: string
  }

  http: {
    host: string
    port: number
    prefix: string
    compress: boolean
  }
}

export type IDatabaseProvider = 'mysql' | 'mariadb' | 'postgres' | 'mongo'
export interface IConfigDatabase {
  replication?: {
    provider: IDatabaseProvider
    master: string
    slaves: string[]
  }
  tenant?: [
    {
      key: string
      provider: IDatabaseProvider
      master: string
      slaves: string[]
      replication: boolean
    },
  ]
}

export interface IConfigHelper {
  salt: {
    length: number
  }
  jwt: {
    defaultSecretKey: string
    defaultExpirationTime: number
    notBeforeExpirationTime: number
  }
  http: {
    maxRedirects: number
    timeout: number
  }
  message: {
    fallback: string | EnumAppLanguage
    availableList: EnumAppLanguage[]
  }
  mailer: {
    dryRun: boolean
    defaultTransport: 'smtp' | 'ses' | string
    transports: {
      smtp: { url: string; from: string }
      ses: { url: string; from: string }
      [key: string]: { url: string; from: string }
    }
  }
}

export interface IConfigLogger {
  level: string
  driver: string | 'file' | 'remote'

  remote: {
    url: string
  }

  file: {
    default: { maxDays: number; maxSize: number }
    system: { maxDays: number; maxSize: number }
    http: { maxDays: number; maxSize: number }
    [key: string]: { maxDays: number; maxSize: number }
  }
}

export interface IConfigRequest {
  body: {
    json: { limitInBytes: number }
    text: { limitInBytes: number }
    urlencoded: { limitInBytes: number }
    applicationOctetStream: { limitInBytes: number }
  }
  cors: {
    allowedOrigin: '*' | string[]
    allowedMethods: string[]
    allowedHeaders: string[]
    exposedHeaders: string[]
  }
  timeoutInMs: number
  cachePrefix: string
  security: {
    enable: boolean
    key: string
    ttl: number
  }
  throttle: {
    ttl: number
    limit: number
  }
}

interface IConfigRedisOptions {
  url: string
  namespace: string
}
export interface IConfigRedis {
  cache: IConfigRedisOptions & {
    ttl: number
  }
  queue: IConfigRedisOptions
  pubsub: IConfigRedisOptions
  realtime: IConfigRedisOptions
  stream: IConfigRedisOptions
}

export interface IConfigSms {
  dryRun: boolean
  drivers: {
    twilio: {
      sender: string
      accountSid: string
      authToken: string
    }
  }
}

export interface IConfigPush {
  dryRun: boolean
  drivers: {
    firebase?: {
      serviceAccountPath: string
    }
    onesignal?: {
      appId: string
      parameters: ConfigurationParameters
    }
  }
}

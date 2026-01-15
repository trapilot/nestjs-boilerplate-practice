import { EnumAppEnvironment, EnumAppLanguage, EnumAppTimezone, EnumMessageLanguage } from '../enums'

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

  wssEnable: boolean
  jobEnable: boolean
}

export type IDatabaseProvider = 'mysql' | 'mariadb' | 'postgres' | 'mongo'
export interface IConfigDatabase {
  debug: boolean
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
    fallback: string | EnumMessageLanguage
    availableList: EnumMessageLanguage[]
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

export interface IConfigNotification {
  sms: {
    dryRun: boolean
    twilio: {
      accountSid: string
      authToken: string
    }
  }
  email: {
    dryRun: boolean
    transport: string
    noReply: string
  }
  push: {
    dryRun: boolean
    firebase: {
      serviceAccountPath: string
    }
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

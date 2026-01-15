/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum EnumAppEnvironment {
  PRODUCTION = 'production',
  STABLE = 'stable',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
}

export enum EnumAppLanguage {
  EN = 'en',
  VI = 'vi',
  CN = 'zh_CN',
  HK = 'zh_HK',
  TW = 'zh_TW',
  MO = 'zh_MO',
}

export enum EnumAppTimezone {
  UTC = 'UTC',
  GMT = 'GMT',
  AMERICA_NEW_YORK = 'America/New_York',
  AMERICA_CHICAGO = 'America/Chicago',
  AMERICA_DENVER = 'America/Denver',
  AMERICA_LOS_ANGELES = 'America/Los_Angeles',
  AMERICA_ANCHORAGE = 'America/Anchorage',
  AMERICA_HONOLULU = 'America/Honolulu',
  AMERICA_HALIFAX = 'America/Halifax',
  EUROPE_LONDON = 'Europe/London',
  EUROPE_PARIS = 'Europe/Paris',
  EUROPE_BERLIN = 'Europe/Berlin',
  EUROPE_ROME = 'Europe/Rome',
  ASIA_HONG_KONG = 'Asia/Hong_Kong',
  ASIA_HO_CHI_MINH = 'Asia/Ho_Chi_Minh',
  ASIA_TOKYO = 'Asia/Tokyo',
  ASIA_SHANGHAI = 'Asia/Shanghai',
  AUSTRALIA_SYDNEY = 'Australia/Sydney',
  AUSTRALIA_MELBOURNE = 'Australia/Melbourne',
}

export enum EnumNumberLocale {
  EN = 'en',
  VI = 'vn-VI',
  CN = 'zh-CN',
  HK = 'zh-HK',
  TW = 'zh-TW',
  MO = 'zh-MO',
}

export enum EnumNumberCurrency {
  EN = 'USD',
  VI = 'VND',
  CN = 'HKD',
  HK = 'HKD',
  TW = 'HKD',
  MO = 'HKD',
}

export enum EnumScopeType {
  HTTP = 'http',
  CRON = 'cron',
  QUEUE = 'queue',
  COMMAND = 'command',
}

export enum EnumRouteType {
  PUB = 'pub',
  CMS = 'cms',
  APP = 'app',
  WEB = 'web',
}

export enum EnumRoutePath {
  PUB = '/',
  CMS = '/admin',
  APP = '/app',
  WEB = '/web',
}

export enum EnumUserType {
  UNKNOWN = 'unknown',
  MALE = 'make',
  FEMALE = 'female',
}

export enum EnumLoggerSeverity {
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace',
}

export enum EnumTierCode {
  NORMAL = 'NORMAL',
  BLUE = 'BLUE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  BLACK = 'BLACK',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

export enum ENUM_APP_ENVIRONMENT {
  PRODUCTION = 'production',
  STABLE = 'stable',
  STAGING = 'staging',
  DEVELOPMENT = 'development',
}

export enum ENUM_APP_API_TYPE {
  PUB = 'PUB',
  CMS = 'CMS',
  APP = 'APP',
  WEB = 'WEB',
}

export enum ENUM_APP_API_ROUTE {
  PUB = '/',
  CMS = '/admin',
  APP = '/app',
  WEB = '/web',
}

export enum ENUM_DEVICE_PLATFORM {
  IOS = 'IOS',
  AOS = 'AOS',
}

export enum ENUM_APP_TIMEZONE {
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

export enum ENUM_APP_LANGUAGE {
  EN = 'en',
  VI = 'vi',
  CN = 'zh_CN',
  HK = 'zh_HK',
  TW = 'zh_TW',
  MO = 'zh_MO',
}

export enum ENUM_MESSAGE_LANGUAGE {
  EN = 'en',
  VI = 'vi',
  CN = 'sc',
  HK = 'tc',
  TW = 'sc',
  MO = 'sc',
}

export enum ENUM_NUMBER_LANGUAGE {
  EN = 'en',
  VI = 'vn-VI',
  CN = 'zh-CN',
  HK = 'zh-HK',
  TW = 'zh-TW',
  MO = 'zh-MO',
}

export enum ENUM_CURRENCY_LANGUAGE {
  EN = 'USD',
  CN = 'HKD',
  HK = 'HKD',
  TW = 'HKD',
  MO = 'HKD',
}

export enum ENUM_GENDER_TYPE {
  UNKNOWN = 'UNKNOWN',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum ENUM_VERIFICATION_TYPE {
  REGISTER = 'REGISTER',
  RESET_PASSWORD = 'RESET_PASSWORD',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

export enum ENUM_DISCOUNT_TYPE {
  PERCENT = 'PERCENT',
  FLAT = 'FLAT',
}

export enum ENUM_CALCULATE_TYPE {
  MULTIPLE = 'MULTIPLE',
  PLUS = 'PLUS',
}

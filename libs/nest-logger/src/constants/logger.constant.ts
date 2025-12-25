export const LOGGER_MODULE_OPTIONS = 'LOGGER_MODULE_OPTIONS'

export const LOGGER_MESSAGE_KEY = 'message'
export const LOGGER_CONTEXT_KEY = 'context'

export const LOGGER_REQUEST_ID_HEADERS = ['x-correlation-id', 'x-request-id'] as const

export const LOGGER_SENSITIVE_PATHS: string[] = [
  'req.body',
  'req.headers',
  'res.body',
  'res.headers',
  'request.body',
  'request.headers',
  'response.body',
  'response.headers',
] as const

export const LOGGER_SENSITIVE_FIELDS: string[] = [
  'password',
  'newPassword',
  'oldPassword',
  'token',
  'authorization',
  'bearer',
  'secret',
  'credential',
  'jwt',
  'x-api-key',
  'apiKey',
  'refreshToken',
  'accessToken',
  'sessionId',
  'privateKey',
  'secretKey',
  'otp',
  'recoveryCode',
  'location',
  'gps',
  'coordinates',
  'latitude',
  'longitude',
] as const

export const LOGGER_EXCLUDED_ROUTES: string[] = [
  '/api/health*',
  '/metrics*',
  '/favicon.ico',
  '/docs*',
  '/',
] as const

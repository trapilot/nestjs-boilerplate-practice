export const LOGGER_MODULE_OPTIONS = 'LOGGER_MODULE_OPTIONS'

export const LOGGER_EXCLUDED_ROUTES: string[] = [
  '/api/health*',
  '/metrics*',
  '/favicon.ico',
  '/docs*',
  '/',
] as const

export const LOGGER_SENSITIVE_FIELDS: string[] = [
  'password',
  'newPassword',
  'oldPassword',
  'token',
  'authorization',
  'bearer',
  'cookie',
  'secret',
  'credential',
  'jwt',
  'token',
  'x-api-key',
  'set-cookie',
]

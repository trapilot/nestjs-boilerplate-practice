import AppConfig from './app.config'
import AuthConfig from './auth.config'
import DatabaseConfig from './database.config'
import HelperConfig from './helper.config'
import MiddlewareConfig from './middleware.config'
import NotificationConfig from './notification.config'
import RedisConfig from './redis.config'

// export default {
//   cache: true,
//   expandVariables: true,
//   envFilePath: ['.env'],
//   load: [
//     AppConfig,
//     AuthConfig,
//     DatabaseConfig,
//     HelperConfig,
//     MiddlewareConfig,
//     NotificationConfig,
//     RedisConfig,
//   ],
// }

export default [
  AppConfig,
  AuthConfig,
  DatabaseConfig,
  HelperConfig,
  MiddlewareConfig,
  NotificationConfig,
  RedisConfig,
]

import { Logger, RequestMethod, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestApplication, NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from 'app/app.module'
import { AppEnvDto } from 'app/dtos/app.env.dto'
import { useContainer } from 'class-validator'
import compression from 'compression'
import {
  AppUtil,
  FileUtil,
  INextFunction,
  IRequestApp,
  IResponseApp,
  MessageService,
  StrUtil,
} from 'lib/nest-core'
import docSetup from 'tools/swagger'

async function bootstrap(): Promise<void> {
  const app: NestApplication = await NestFactory.create(AppModule, {
    cors: false,
    bodyParser: false,
    bufferLogs: false,
    abortOnError: true,
  })

  const config = app.get(ConfigService)
  const appTz: string = config.get<string>('app.timezone')
  const appEnv: string = config.get<string>('app.env')
  const appHost: string = config.get<string>('app.http.host')
  const appPort: number = config.get<number>('app.http.port')
  const appPrefix: string = config.get<string>('app.http.prefix')
  const appCompress: boolean = config.get<boolean>('app.http.compress')
  const urlVersionPrefix: string = config.get<string>('app.urlVersion.prefix')

  // Override Env
  process.env.NODE_ENV = appEnv
  process.env.TZ = appTz

  // Logger
  const logger = new Logger()

  // Custom Validation
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  })

  // Starts listening for shutdown hooks
  app.enableShutdownHooks()

  // Static
  app.useStaticAssets(FileUtil.joinRoot(['public']), { prefix: '/public/' })
  app.useStaticAssets(FileUtil.joinRoot(['public', 'static']), { prefix: '/interact/' })

  // Global
  app.setGlobalPrefix(appPrefix, {
    exclude: [
      { path: '^admin/*splat', method: RequestMethod.ALL },
      { path: '^health/*splat', method: RequestMethod.ALL },
      { path: '^metrics/*splat', method: RequestMethod.ALL },
    ],
  })

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: urlVersionPrefix,
  })

  // Compression
  if (appCompress) {
    app.use(compression())
  }

  // Validate Env
  const errors = await AppUtil.validateDto(AppEnvDto, process.env, {
    skipMissingProperties: false,
    skipNullProperties: false,
    skipUndefinedProperties: false,
    validationError: {
      target: false,
      value: true,
    },
  })
  if (errors.length > 0) {
    const messageService = app.get(MessageService)
    const messageErrors = messageService.setValidationMessage(errors)

    throw new Error('Env Variable Invalid', {
      cause: messageErrors,
    })
  }

  // WebSocket Server
  if (StrUtil.isTrue(process.env.APP_WEBSOCKET)) {
    app.useWebSocketAdapter(new IoAdapter(app))
  }

  // set response for log
  app.use(function (req: IRequestApp, res: IResponseApp, next: INextFunction) {
    // Ignore favicon
    if (req.originalUrl?.endsWith('favicon.ico')) {
      return res.sendStatus(204)
    }
    // Ignore devtools
    if (req.originalUrl?.endsWith('devtools.json')) {
      return res.sendStatus(204)
    }
    // Ignore admin vite
    if (req.originalUrl?.endsWith('vite.svg')) {
      return res.sendStatus(204)
    }

    const orgSend = res.send.bind(res)
    res.send = (body: unknown) => {
      res.body = body
      return orgSend(body)
    }

    next()
  })

  // Setup Tools
  await docSetup(app)

  // Listen
  await app.listen(appPort, appHost)

  logger.log(`==========================================================`)

  logger.log(`App is running on ${appEnv}`)
  logger.log(`Http Server running on ${await app.getUrl()}`)

  logger.log(`==========================================================`)
}

bootstrap()

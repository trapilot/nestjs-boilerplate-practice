import { Logger, RequestMethod, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestApplication, NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from 'app/app.module'
import { CliModule } from 'app/cli.module'
import { plainToInstance } from 'class-transformer'
import { useContainer, validate } from 'class-validator'
import compression from 'compression'
import { FileUtil, INextFunction, IRequestApp, IResponseApp, MessageService } from 'lib/nest-core'
import { CommandFactory } from 'nest-commander'
import { AppEnvDto } from 'shared/dtos'
import docSetup from 'src/swagger'

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule, {
    cors: false,
    bodyParser: false,
    bufferLogs: false,
    abortOnError: true,
  })

  const config = app.get(ConfigService)
  const appEnv: string = config.get<string>('app.env')
  const appHost: string = config.get<string>('app.http.host', 'localhost')
  const appPort: number = config.get<number>('app.http.port', 3000)
  const appPrefix: string = config.get<string>('app.http.prefix', 'api')
  const appTz: string = config.get<string>('app.timezone')
  const urlVersionPrefix: string = config.get<string>('app.urlVersion.prefix')

  // Override Env
  process.env.NODE_ENV = appEnv
  process.env.TZ = appTz

  // Logger
  const logger = new Logger()

  // Compression
  app.use(compression())

  // Global
  app.setGlobalPrefix(`/${appPrefix}`, {
    exclude: [
      { path: '^admin/*splat', method: RequestMethod.ALL },
      { path: '^health/*splat', method: RequestMethod.ALL },
      { path: '^metrics/*splat', method: RequestMethod.ALL },
    ],
  })

  // Custom Validation
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true,
  })

  // Static
  app.useStaticAssets(FileUtil.joinRoot(['public']), { prefix: '/public/' })
  app.useStaticAssets(FileUtil.joinRoot(['public', 'static']), { prefix: '/interact/' })

  // Starts listening for shutdown hooks
  app.enableShutdownHooks()

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: urlVersionPrefix,
  })

  // Validate Env
  const classEnv = plainToInstance(AppEnvDto, process.env)
  const errors = await validate(classEnv)
  if (errors.length > 0) {
    const messageService = app.get(MessageService)
    const messageErrors = messageService.setValidationMessage(errors)

    throw new Error('Env Variable Invalid', {
      cause: messageErrors,
    })
  }

  // WebSocket Server
  if (config.get<boolean>('app.wssEnable', false)) {
    app.useWebSocketAdapter(new IoAdapter(app))
  }

  // Setup Tools
  await docSetup(app)

  // set response for log
  app.use(function (req: IRequestApp, res: IResponseApp, next: INextFunction) {
    if (req.originalUrl && req.originalUrl.split('/').pop() === 'favicon.ico') {
      return res.sendStatus(204)
    }

    const send = res.send
    res.send = function (body: any) {
      res.body = body
      send.call(this, body)
    }
    next()
  })

  // Listen
  await app.listen(appPort, appHost)

  logger.log(`==========================================================`)

  logger.log(`App is running on ${appEnv.toUpperCase()} mode`)
  logger.log(`Http Server running on ${await app.getUrl()}`)

  logger.log(`==========================================================`)
}

const isCli = process.argv.length >= 3
if (isCli) {
  CommandFactory.run(CliModule, ['warn', 'debug', 'error', 'fatal'])
    .then(() => process.exit(0))
    .catch((_) => process.exit(1))
} else {
  bootstrap()
}

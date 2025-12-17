/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Logger, RequestMethod, VersioningType } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestApplication, NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { AppModule } from 'app/app.module'
import { CliModule } from 'app/cli.module'
import { AppEnvDto } from 'app/dtos'
import { plainToInstance } from 'class-transformer'
import { useContainer, validate } from 'class-validator'
import compression from 'compression'
import {
  HelperMessageService,
  INextFunction,
  IRequestApp,
  IResponseApp,
  ROOT_PATH,
} from 'lib/nest-core'
import { CommandFactory } from 'nest-commander'
import { join } from 'path'
import docSetup from 'src/swagger'

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(AppModule, {
    cors: false,
    bodyParser: false,
    bufferLogs: false,
    abortOnError: true,
  })

  const config = app.get(ConfigService)
  const env: string = config.get<string>('app.env')
  const host: string = config.get<string>('app.http.host', 'localhost')
  const port: number = config.get<number>('app.http.port', 3000)
  const timezone: string = config.get<string>('app.timezone')
  const globalPrefix: string = config.get<string>('app.globalPrefix')
  const versioningPrefix: string = config.get<string>('app.urlVersion.prefix')

  // Override Env
  process.env.NODE_ENV = env
  process.env.TZ = timezone

  // Logger
  const logger = new Logger()

  // Compression
  app.use(compression())

  // Global
  app.setGlobalPrefix(globalPrefix, {
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
  app.useStaticAssets(join(ROOT_PATH, 'public'), { prefix: '/public/' })
  app.useStaticAssets(join(ROOT_PATH, 'public', 'static'), { prefix: '/interact/' })

  // Starts listening for shutdown hooks
  app.enableShutdownHooks()

  // Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: versioningPrefix,
  })

  // Validate Env
  const classEnv = plainToInstance(AppEnvDto, process.env)
  const errors = await validate(classEnv)
  if (errors.length > 0) {
    const messageService = app.get(HelperMessageService)
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
  await app.listen(port, host)

  logger.log(`==========================================================`)

  logger.log(`App is running on ${env.toUpperCase()} mode`)
  logger.log(`Http Server running on ${await app.getUrl()}`)

  logger.log(`==========================================================`)
}

const isCli = process.argv.length >= 3
isCli ? CommandFactory.run(CliModule, ['warn', 'debug', 'error', 'fatal']) : bootstrap()

import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ENUM_APP_ENVIRONMENT } from 'lib/nest-core'
import { writeFileSync } from 'node:fs'
import {
  RoutesAdminModule,
  RoutesAppModule,
  RoutesPublicModule,
  RoutesWebModule,
} from 'src/app/router/routes'

export default async function (app: INestApplication) {
  const config = app.get(ConfigService)
  const env = config.get<ENUM_APP_ENVIRONMENT>('app.env')
  const appVersion = config.get<boolean>('app.urlVersion.version')

  const builder = () => {
    const documentBuilder = new DocumentBuilder()
      .setTitle(`[${process.env.APP_NAME}] APIs Specification`)
      .setDescription(`API developed throughout the API with NestJS`)
      .setVersion('1.0')
      .addServer('/')

    if (env === ENUM_APP_ENVIRONMENT.DEVELOPMENT && process.env.UAT_URL) {
      documentBuilder.addServer(process.env.UAT_URL)
    }
    if (appVersion) {
      documentBuilder.setVersion(`${appVersion}.0`)
    }
    return documentBuilder
  }

  const apiKeys = [{ name: 'apiKey', options: { type: 'apiKey', in: 'header', name: 'x-api-key' } }]
  const bearerAuths = [
    { name: 'accessToken', options: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    { name: 'refreshToken', options: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  ]

  docs(app, env, builder(), { prefix: 'api', routes: [RoutesPublicModule], apiKeys })
  docs(app, env, builder(), { prefix: 'app', routes: [RoutesAppModule], bearerAuths })
  docs(app, env, builder(), { prefix: 'web', routes: [RoutesWebModule], bearerAuths })
  docs(app, env, builder(), { prefix: 'admin', routes: [RoutesAdminModule], bearerAuths })
}

const docs = (
  app: INestApplication,
  env: ENUM_APP_ENVIRONMENT,
  documentBuilder: DocumentBuilder,
  documentOptions: { prefix: string; routes: any[]; apiKeys?: any[]; bearerAuths?: any[] },
) => {
  if (documentOptions?.apiKeys) {
    documentOptions.apiKeys.forEach((apiKey) =>
      documentBuilder.addApiKey(apiKey.options, apiKey.name),
    )
  }
  if (documentOptions?.bearerAuths) {
    documentOptions.bearerAuths.forEach((bearerAuth) =>
      documentBuilder.addBearerAuth(bearerAuth.options, bearerAuth.name),
    )
  }

  const documentJsonFile = `public/docs/swagger-${documentOptions.prefix}.json`
  documentBuilder.setDescription(
    `Json Schema: <a target="_blank" href="${documentJsonFile}">click here</a>`,
  )
  const documentBuild = documentBuilder.build()
  const document = SwaggerModule.createDocument(app, documentBuild, {
    deepScanRoutes: true,
    include: documentOptions.routes,
  })

  writeFileSync(documentJsonFile, JSON.stringify(document))
  SwaggerModule.setup(`${documentOptions.prefix}-docs`, app, document, {
    jsonDocumentUrl: documentJsonFile,
    explorer: true,
    customSiteTitle: documentBuild.info.title,
    customfavIcon: '/public/favicon.ico',
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: env === ENUM_APP_ENVIRONMENT.DEVELOPMENT,
      displayOperationId: true,
      operationsSorter: 'method',
      // tagsSorter: 'alpha',
      useUnsafeMarkdown: true,
      tryItOutEnabled: true,
      filter: true,
      deepLinking: true,
    },
  })
}

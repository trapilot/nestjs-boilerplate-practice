import { INestApplication, Type } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { SecuritySchemeObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { RoutesAdminModule } from 'app/routes/routes.admin.module'
import { RoutesAppModule } from 'app/routes/routes.app.module'
import { RoutesPublicModule } from 'app/routes/routes.public.module'
import { RoutesWebModule } from 'app/routes/routes.web.module'
import { EnumAppEnvironment } from 'lib/nest-core'
import { writeFileSync } from 'node:fs'

interface ISecurityOptions {
  name: string
  options: SecuritySchemeObject
}

export default async function (app: INestApplication): Promise<void> {
  const config = app.get(ConfigService)
  const env = config.get<EnumAppEnvironment>('app.env')
  const appVersion = config.get<boolean>('app.urlVersion.version')

  const builder = (): DocumentBuilder => {
    const documentBuilder = new DocumentBuilder()
      .setTitle(`[${process.env.APP_NAME}] APIs Specification`)
      .setDescription(`API developed throughout the API with NestJS`)
      .setVersion('1.0')
      .addServer('/')

    if (env === EnumAppEnvironment.DEVELOPMENT && process.env.UAT_URL) {
      documentBuilder.addServer(process.env.UAT_URL)
    }
    if (appVersion) {
      documentBuilder.setVersion(`${appVersion}.0`)
    }
    return documentBuilder
  }

  const apiKeys: ISecurityOptions[] = [
    { name: 'apiKey', options: { type: 'apiKey', in: 'header', name: 'x-api-key' } },
  ]
  const bearerAuths: ISecurityOptions[] = [
    { name: 'accessToken', options: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    { name: 'refreshToken', options: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  ]

  setup(app, builder(), { env, prefix: 'api', routes: [RoutesPublicModule], apiKeys })
  setup(app, builder(), { env, prefix: 'app', routes: [RoutesAppModule], bearerAuths })
  setup(app, builder(), { env, prefix: 'web', routes: [RoutesWebModule], bearerAuths })
  setup(app, builder(), { env, prefix: 'admin', routes: [RoutesAdminModule], bearerAuths })
}

const setup = (
  app: INestApplication,
  documentBuilder: DocumentBuilder,
  documentOptions: {
    env: EnumAppEnvironment
    prefix: string
    routes: Type<unknown>[]
    apiKeys?: ISecurityOptions[]
    bearerAuths?: ISecurityOptions[]
  },
): void => {
  if (documentOptions?.apiKeys) {
    documentOptions.apiKeys.forEach(apiKey =>
      documentBuilder.addApiKey(apiKey.options, apiKey.name),
    )
  }
  if (documentOptions?.bearerAuths) {
    documentOptions.bearerAuths.forEach(bearerAuth =>
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
      persistAuthorization: documentOptions.env === EnumAppEnvironment.DEVELOPMENT,
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

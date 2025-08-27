import { Injectable, NestMiddleware } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import bodyParser from 'body-parser'
import { INextFunction, IRequestApp, IResponseApp } from 'lib/nest-core'

interface IBodyParseOptions {
  json: bodyParser.OptionsJson
  raw: bodyParser.Options
  text: bodyParser.OptionsText
  urlencoded: bodyParser.OptionsUrlencoded
}

@Injectable()
export class RequestBodyParserMiddleware implements NestMiddleware {
  private readonly options: IBodyParseOptions

  constructor(private readonly config: ConfigService) {
    this.options = this.config.get<IBodyParseOptions>('middleware.body')
  }

  use(req: IRequestApp, res: IResponseApp, next: INextFunction): void {
    req.rawBody = req.body

    const isJson = req.is('application/json')
    const isPlainText = req.is('text/plain')
    const isFormData = req.is('multipart/form-data')
    const isUrlencoded = req.is('application/x-www-form-urlencoded')

    if (isFormData) {
      /**
       * Implement & debug later
       * (multer().any())(req, res, next)
       * */
      next()
    } else if (isJson) {
      bodyParser.json(this.options.json)(req, res, next)
    } else if (isPlainText) {
      bodyParser.text(this.options.text)(req, res, next)
    } else if (isUrlencoded) {
      bodyParser.urlencoded(this.options.urlencoded)(req, res, next)
    } else {
      bodyParser.raw(this.options.raw)(req, res, next)
    }
  }
}

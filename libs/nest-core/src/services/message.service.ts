import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { getMetadataStorage, ValidationError } from 'class-validator'
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata'
import { AppContext } from 'lib/nest-core'
import { I18nService, I18nTranslation } from 'nestjs-i18n'
import { IMessageError, IMessageErrorOptions, IMessageSetOptions } from '../interfaces'

@Injectable()
export class MessageService {
  private readonly debug: boolean
  private readonly defaultLanguage: string
  private readonly availableLanguages: string[]

  constructor(
    private readonly i18n: I18nService,
    private readonly config: ConfigService,
  ) {
    this.debug = this.config.get<boolean>('app.debug.enable')
    this.defaultLanguage = this.config.get<string>('helper.message.fallback')
    this.availableLanguages = this.config.get<string[]>('helper.message.availableList')
  }

  getAvailableLanguages(number: number = 0): string[] {
    if (number) {
      return this.availableLanguages.slice(0, number)
    }
    return this.availableLanguages
  }

  getDefaultLanguage(): string {
    return this.defaultLanguage
  }

  getRequestLanguage(): string {
    try {
      return AppContext.language()
    } catch (err: unknown) {}
    return this.getDefaultLanguage()
  }

  getTranslations(): I18nTranslation {
    try {
      return this.i18n.getTranslations()
    } catch (err: unknown) {}
    return {}
  }

  filterLanguage(customLanguage: string): string[] {
    if (this.availableLanguages.includes(customLanguage)) {
      return [customLanguage]
    }
    return []
  }

  setMessage(path: string, options?: IMessageSetOptions): string {
    const language: string = options?.customLanguage
      ? this.filterLanguage(options.customLanguage)[0]
      : this.defaultLanguage

    return this.i18n.translate(path, {
      debug: this.debug,
      lang: language,
      args: options?.properties,
      defaultValue: this.isMessage(path) ? path : undefined,
    }) as any
  }

  private isMessage(key: string): boolean {
    if (!key.includes('.')) return true
    return key.replace(/\s/g, '').length !== key.length
  }

  private key(constraint: string): string {
    return constraint
      .replace(/Constraint$/g, '')
      .replace(/\s(.)/g, ($1) => $1.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, ($1) => $1.toLowerCase())
  }

  setValidationMessage(
    requestErrors: ValidationError[],
    options?: IMessageErrorOptions,
  ): IMessageError[] {
    const messages: Array<IMessageError[]> = []
    const metadataStorage = getMetadataStorage()
    for (const requestError of requestErrors) {
      const errors: IMessageError[] = []
      if (requestError?.target) {
        let target: any = requestError.target
        let children: Record<string, any>[] = requestError.children
        let constraints: string[] = Object.keys(requestError.constraints ?? []).reverse()
        let property: string = requestError.property
        let propertyValue: string = requestError.value
        let errorLimits: ValidationMetadata[] = metadataStorage
          .getTargetValidationMetadatas(target.constructor, target.constructor.name, true, false)
          .filter((meta) => meta.target === target.constructor)

        while (children?.length > 0) {
          property = `${property}.${children[0].property}`

          if (children[0].children?.length > 0) {
            children = children[0].children
          } else {
            target = children[0].target
            constraints = Object.keys(children[0].constraints).reverse()
            propertyValue = children[0].value
            children = []
            errorLimits = metadataStorage
              .getTargetValidationMetadatas(
                target.constructor,
                target.constructor.name,
                true,
                false,
              )
              .filter((meta) => meta.target === target.constructor)
          }
        }

        for (const constraint of constraints) {
          const errorMeta = errorLimits.find((meta) => meta.name === constraint)
          const errorPath = `request.${this.key(constraint)}`

          errors.push({
            property,
            message: this.setMessage(requestError?.constraints?.[constraint] || errorPath, {
              customLanguage: options?.customLanguage,
              properties: {
                property,
                value: propertyValue,
                target: requestError.target,
                contexts: requestError.contexts,
                constraints: errorMeta?.constraints ?? requestError?.constraints?.[constraint],
              },
            }),
          })
        }

        messages.push(errors)
      } else {
        const validationError = options?.validationError?.[requestError.property] || {}
        const [errorMsg, errorVal] = requestError.value.split('|')
        errors.push({
          property: requestError.property,
          message: this.setMessage(errorMsg, {
            customLanguage: options?.customLanguage,
            properties: {
              property: requestError.property,
              value: errorVal,
              contexts: requestError?.contexts ?? {},
              constraints: requestError?.constraints ?? {},
              ...validationError,
            },
          }),
        })
        messages.push(errors)
      }
    }

    return messages.flat(1) as IMessageError[]
  }
}

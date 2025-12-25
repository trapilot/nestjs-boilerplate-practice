import { MESSAGE_LANGUAGES } from '../constants'
import { AppContext } from '../helpers'

export class LocaleUtil {
  static buildFields(
    jsonFields: Record<string, any>[],
    fieldName: string,
    fieldLang: string = 'language',
  ): any {
    return MESSAGE_LANGUAGES.reduce((fields, language) => {
      const jsonField = jsonFields.find((jsonField) => jsonField[fieldLang] === language)
      fields[language] = jsonField?.[fieldName] ?? ''
      return fields
    }, {})
  }

  static parseValue(jsonValue: any, language?: string): string {
    if (jsonValue) {
      return jsonValue[language || AppContext.language()] ?? ''
    }
    return ''
  }
}

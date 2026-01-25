import { IExportableMetadata } from '../interfaces'
import { DecoratorPropertyStorage } from '../storages'

export function Exportable(options?: IExportableMetadata): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    DecoratorPropertyStorage.register<IExportableMetadata>(
      target.constructor,
      propertyName,
      options,
    )
  }
}

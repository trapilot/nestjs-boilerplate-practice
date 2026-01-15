import { IExportableMetadata } from '../interfaces'
import { PropertyDecoratorStorage } from '../storages'

export function Exportable(options?: IExportableMetadata): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    PropertyDecoratorStorage.register<IExportableMetadata>(
      target.constructor,
      propertyName,
      options,
    )
  }
}

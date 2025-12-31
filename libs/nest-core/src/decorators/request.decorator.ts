import { IExportableMetadata } from '../interfaces'
import { PropertyStorage } from '../storages'

export function Exportable(options?: IExportableMetadata): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    PropertyStorage.store<IExportableMetadata>(target.constructor, propertyName, options)
  }
}

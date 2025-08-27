import { ExportableMetadata, NestMetadata } from 'lib/nest-core'

export function Exportable(options?: ExportableMetadata): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    NestMetadata.storeExportableMetadata(target.constructor, propertyName, options)
  }
}

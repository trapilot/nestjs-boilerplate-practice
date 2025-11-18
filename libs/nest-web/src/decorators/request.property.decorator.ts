import { ExportableMetadata, MetadataHelper } from 'lib/nest-core'

export function Exportable(options?: ExportableMetadata): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    MetadataHelper.storeExportableMetadata(target.constructor, propertyName, options)
  }
}

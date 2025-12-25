import { IExportableMetadata, MetadataUtil } from 'lib/nest-core'

export function Exportable(options?: IExportableMetadata): PropertyDecorator {
  return (target: object, propertyName: string | symbol) => {
    MetadataUtil.store<IExportableMetadata>(target.constructor, propertyName, options)
  }
}

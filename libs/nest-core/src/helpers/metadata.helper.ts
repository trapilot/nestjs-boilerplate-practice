import 'reflect-metadata'

export interface ExportableMetadata {
  sorting?: number
  domain?: string
  message?: string
}

export class MetadataHelper {
  private static metadata = new Map<string, Map<string, ExportableMetadata>>()

  /**
   * Store exportable metadata for a class (target) with its properties.
   * This method will also traverse parent classes and store metadata for all.
   */
  static storeExportableMetadata(
    target: Function,
    propertyName: string | symbol,
    metadata: ExportableMetadata,
  ): void {
    let currentTarget = target

    // Traverse up the prototype chain to handle inheritance
    while (currentTarget !== Object.prototype) {
      const className = currentTarget.name
      if (!this.metadata.has(className)) {
        this.metadata.set(className, new Map<string, ExportableMetadata>())
      }

      // Store the metadata for the property
      const classMetadata = this.metadata.get(className)!
      const existingMetadata = classMetadata.get(String(propertyName)) || {}

      // Merge the new metadata with the existing one
      classMetadata.set(String(propertyName), { ...existingMetadata, ...metadata })

      // Move up to the parent class
      currentTarget = Object.getPrototypeOf(currentTarget)
    }
  }

  /**
   * Retrieve all exportable properties for a class, including those from parent classes.
   * This method will also consider intersection types and combine metadata.
   */
  static getExportableProperties(target: Function): Map<string, ExportableMetadata> {
    let currentTarget = target
    const exportableProperties = new Map<string, ExportableMetadata>()

    // Traverse up the prototype chain to get metadata from parent classes
    while (currentTarget !== Object.prototype) {
      const className = currentTarget.name

      // If metadata exists for the class, merge it
      const properties = this.metadata.get(className)
      if (properties) {
        properties.forEach((metadata, propertyName) => {
          // If metadata for the property already exists, merge it
          if (exportableProperties.has(propertyName)) {
            const existingMetadata = exportableProperties.get(propertyName)
            exportableProperties.set(propertyName, { ...existingMetadata, ...metadata })
          } else {
            exportableProperties.set(propertyName, metadata)
          }
        })
      }

      // Move up to the parent class
      currentTarget = Object.getPrototypeOf(currentTarget)
    }

    return exportableProperties
  }
}

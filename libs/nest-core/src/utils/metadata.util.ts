import 'reflect-metadata'

export class MetadataUtil {
  private static metadata = new Map<string, Map<string, any>>()

  /**
   * Store exportable metadata for a class (target) with its properties.
   * This method will also traverse parent classes and store metadata for all.
   */
  static store<T>(target: Function, propertyName: string | symbol, metadata: T): void {
    let currentTarget = target

    // Traverse up the prototype chain to handle inheritance
    while (currentTarget !== Object.prototype) {
      const className = currentTarget.name
      if (!this.metadata.has(className)) {
        this.metadata.set(className, new Map<string, T>())
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
  static getProperties<T>(target: Function): Map<string, T> {
    let currentTarget = target
    const exportableProperties = new Map<string, T>()

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

import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer'

export class ResponseUtil {
  static mapToProperties<T>(
    data: T,
    options: {
      type: ClassConstructor<T>
      transform: ClassTransformOptions
      allowProperties: Record<string, any>
      ignoreProperties: string[]
    },
  ) {
    return Object.keys(plainToInstance(options.type, {}, options.transform)).filter((property) => {
      if (data[property] === undefined) return false
      if (options.ignoreProperties.includes(property)) return true
      return options.allowProperties.has(property)
    })
  }

  static mapToInstance<T>(
    data: T,
    options: {
      type: ClassConstructor<T>
      transform: ClassTransformOptions
      mappingProperties?: Record<string, any>
    },
  ) {
    const transformOptions = {
      excludeExtraneousValues: true,
      excludePrefixes: ['_', '__'],
      ...options.transform,
    }

    if (options?.mappingProperties) {
      return plainToInstance(
        options.type,
        { __mappingProperties: options.mappingProperties, ...data },
        transformOptions,
      )
    }
    return plainToInstance(options.type, data, transformOptions)
  }

  static mapToInstances<T>(
    data: T[],
    options: {
      type: ClassConstructor<T>
      transform: ClassTransformOptions
      mappingProperties?: Record<string, any>
    },
  ) {
    const transformOptions = {
      excludeExtraneousValues: true,
      excludePrefixes: ['_', '__'],
      ...options.transform,
    }

    if (options?.mappingProperties) {
      data.forEach((v) => {
        return { __mappingProperties: options.mappingProperties, ...v }
      })
    }
    return plainToInstance(options.type, data, transformOptions)
  }
}

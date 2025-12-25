import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { readFileSync, unlinkSync } from 'fs'
import imageSize from 'image-size'
import {
  AlgorithmHelper,
  FILE_RATIO_MAX_ROUNDING,
  FILE_SIZE_MAX_ROUNDING,
  IFile,
} from 'lib/nest-core'
import { EntityValidateBuilder, EntityValidateException } from '../exceptions'

@Injectable()
export class RequestFileSizePipe implements PipeTransform {
  private validationBuilder: EntityValidateBuilder
  constructor(
    readonly sizes: string[],
    readonly field?: string,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<IFile | IFile[]> {
    if (!value) {
      return value
    }

    let fieldValue = value

    if (this.field) {
      fieldValue = value[this.field]
    }

    if (
      !fieldValue ||
      Object.keys(fieldValue).length === 0 ||
      (Array.isArray(fieldValue) && fieldValue.length === 0)
    ) {
      return value
    }

    this.validationBuilder = EntityValidateException.builder()
    const files: IFile[] = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
    for (const file of files) {
      await this.validate(file, metadata)
    }

    if (this.validationBuilder.hasError()) {
      await this.unlink(files)
      throw this.validationBuilder.build()
    }

    return value
  }

  private async unlink(files: IFile[]): Promise<void> {
    for (const file of files) {
      try {
        unlinkSync(file.path)
      } catch {}
    }
  }

  private async validate(file: IFile, _metadata: ArgumentMetadata): Promise<void> {
    if (process.env.MOCK_FILE_UNLIMITED === 'true') {
      return
    }

    const buffer = readFileSync(file.path)
    const dimension = imageSize(buffer)
    for (const size of this.sizes) {
      const [width, height] = size.split('x').map(Number)

      const adjustWidth = Math.abs(dimension.width - width)
      const adjustHeight = Math.abs(dimension.height - height)
      if (adjustWidth > FILE_SIZE_MAX_ROUNDING || adjustHeight > FILE_SIZE_MAX_ROUNDING) {
        this.validationBuilder.addError({
          property: file.fieldname,
          value: `request.isFileDimension|${dimension.width}x${dimension.height}`,
          constraints: { dimension: size },
        })
      }

      const imageRatio = dimension.width / dimension.height
      const aspectRatio = width / height
      const adjustRatio = Math.abs(imageRatio - aspectRatio)
      if (adjustRatio > FILE_RATIO_MAX_ROUNDING) {
        const commonDivisor = AlgorithmHelper.getGCD(width, height)
        const ratioDivisor = `${width / commonDivisor}:${height / commonDivisor}`

        this.validationBuilder.addError({
          property: file.fieldname,
          value: `request.isFileRatio|${dimension.width}:${dimension.height}`,
          constraints: { ratio: ratioDivisor },
        })
      }
    }

    return
  }
}

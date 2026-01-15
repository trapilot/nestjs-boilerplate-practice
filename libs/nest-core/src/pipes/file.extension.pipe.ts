import {
  HttpStatus,
  Injectable,
  PipeTransform,
  Type,
  UnsupportedMediaTypeException,
  mixin,
} from '@nestjs/common'
import { EnumFileExtension } from '../enums'
import { IFile, IFileInput } from '../interfaces'
import { FileUtil } from '../utils'

export function FileExtensionPipe(allowedExtensions: EnumFileExtension[]): Type<PipeTransform> {
  @Injectable()
  class MixinFileExtensionPipe implements PipeTransform {
    private readonly extensions: ReadonlySet<string> = new Set(allowedExtensions)

    async transform(value: IFileInput): Promise<IFileInput> {
      if (!value) {
        return value
      }

      const fileToValidate = this.extractFilesToValidate(value)
      if (!fileToValidate) {
        return value
      }

      this.validate(fileToValidate)
      return value
    }

    private extractFilesToValidate(value: IFileInput): IFile | null {
      if (this.isEmptyValue(value)) {
        return null
      }
      return value as IFile
    }

    private isEmptyValue(value: unknown): boolean {
      return (
        !value ||
        (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) ||
        (Array.isArray(value) && value.length === 0)
      )
    }

    private validate(file: IFile): void {
      if (!file?.originalname) {
        throw new UnsupportedMediaTypeException({
          statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          message: 'file.error.extensionInvalid',
        })
      }
      this.validateExtension(file.originalname)
    }

    private validateExtension(originalname: string): void {
      const extension = FileUtil.extractExtensionFromFilename(originalname)
      if (!this.extensions.has(extension)) {
        throw new UnsupportedMediaTypeException({
          statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
          message: 'file.error.extensionInvalid',
        })
      }
    }
  }

  return mixin(MixinFileExtensionPipe)
}

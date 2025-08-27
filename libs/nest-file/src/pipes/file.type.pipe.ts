import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { unlinkSync } from 'fs'
import { EntityValidateBuilder, EntityValidateException } from 'lib/nest-core'
import { ENUM_FILE_MIME } from '../enums'
import { IFile } from '../interfaces'

@Injectable()
export class FileTypePipe implements PipeTransform {
  private validationBuilder: EntityValidateBuilder
  constructor(
    readonly mimes: ENUM_FILE_MIME[],
    readonly field?: string,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<IFile | IFile[]> {
    if (!value) {
      return value
    }

    let fieldValue = value
    this.validationBuilder = EntityValidateException.builder()

    if (this.field) {
      fieldValue = value[this.field]
    }

    if (
      Object.keys(fieldValue).length === 0 ||
      (Array.isArray(fieldValue) && fieldValue.length === 0)
    ) {
      return value
    }

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

  private async validate(file: IFile, metadata: ArgumentMetadata): Promise<void> {
    const fileMinetype = file.mimetype as ENUM_FILE_MIME
    if (!this.mimes.includes(fileMinetype)) {
      this.validationBuilder.addError({
        property: file.fieldname,
        value: `request.isFileMime|${file.mimetype}`,
        constraints: {
          mimetype: fileMinetype,
          mimetypeAllowed: this.mimes.join(','),
        },
      })
    }

    return
  }

  private async unlink(files: IFile[]): Promise<void> {
    for (const file of files) {
      try {
        unlinkSync(file.path)
      } catch {}
    }
  }
}

import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { unlinkSync } from 'fs'
import { IFile } from 'lib/nest-core'
import { EntityValidateBuilder, EntityValidateException } from '../exceptions'

@Injectable()
export class RequestFileRequiredPipe implements PipeTransform {
  private validationBuilder: EntityValidateBuilder
  constructor(readonly field?: string) {}

  async transform(value: IFile | IFile[], metadata: ArgumentMetadata): Promise<IFile | IFile[]> {
    let fieldValue = value
    this.validationBuilder = EntityValidateException.builder()

    if (this.field && value instanceof Array) {
      fieldValue = value[this.field] ?? undefined
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

  private async unlink(files: IFile[]): Promise<void> {
    for (const file of files) {
      try {
        unlinkSync(file.path)
      } catch {}
    }
  }

  private async validate(file: IFile | IFile[], metadata: ArgumentMetadata): Promise<void> {
    if (!file || Object.keys(file).length === 0 || (Array.isArray(file) && file.length === 0)) {
      this.validationBuilder.addError({
        property: this.field ?? 'file',
        value: `request.isFileRequire`,
        constraints: { required: true },
      })
    }

    return
  }
}

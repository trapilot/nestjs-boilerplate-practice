import { HttpStatus, Injectable, UnsupportedMediaTypeException } from '@nestjs/common'
import { PipeTransform } from '@nestjs/common/interfaces'
import { EnumFileExtensionDocument } from '../enums'
import { IFile, IFileRows } from '../interfaces'
import { FileUtil } from '../utils'

// Support excel and csv
@Injectable()
export class FileExcelExtractPipe<T> implements PipeTransform {
  async transform(value: IFile): Promise<IFileRows<T>[]> {
    if (!value) {
      return
    }

    await this.validate(value)

    const extracts: IFileRows<T>[] =
      value.mimetype === EnumFileExtensionDocument.CSV
        ? await this.extractsCsv(value)
        : await this.extractsExcel(value)

    return extracts
  }

  async validate(value: IFile): Promise<void> {
    const mimetype = value.mimetype.toLowerCase()
    const supportedFiles: string[] = [EnumFileExtensionDocument.CSV, EnumFileExtensionDocument.XLSX]

    if (!supportedFiles.includes(mimetype)) {
      throw new UnsupportedMediaTypeException({
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        message: 'file.error.mimeInvalid',
      })
    }
  }

  async extractsCsv(value: IFile): Promise<IFileRows<T>[]> {
    const extracts: IFileRows = await FileUtil.readCsv(value)

    return [extracts]
  }

  async extractsExcel(value: IFile): Promise<IFileRows<T>[]> {
    const extracts: IFileRows[] = await FileUtil.readExcel(value, {
      password: value?.password,
    })

    return extracts
  }
}

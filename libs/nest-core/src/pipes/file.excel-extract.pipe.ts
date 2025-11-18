import { HttpStatus, Injectable, UnsupportedMediaTypeException } from '@nestjs/common'
import { PipeTransform } from '@nestjs/common/interfaces'
import { ENUM_FILE_MIME } from '../enums'
import { IFile, IFileRows } from '../interfaces'
import { HelperFileService } from '../services'

// Support excel and csv
@Injectable()
export class FileExcelExtractPipe<T> implements PipeTransform {
  constructor(private readonly fileService: HelperFileService) {}

  async transform(value: IFile): Promise<IFileRows<T>[]> {
    if (!value) {
      return
    }

    await this.validate(value)

    const extracts: IFileRows<T>[] =
      value.mimetype === ENUM_FILE_MIME.CSV
        ? await this.extractsCsv(value)
        : await this.extractsExcel(value)

    return extracts
  }

  async validate(value: IFile): Promise<void> {
    const mimetype = value.mimetype.toLowerCase()
    const supportedFiles: string[] = [ENUM_FILE_MIME.CSV, ENUM_FILE_MIME.XLSX]

    if (!supportedFiles.includes(mimetype)) {
      throw new UnsupportedMediaTypeException({
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        message: 'file.error.mimeInvalid',
      })
    }
  }

  async extractsCsv(value: IFile): Promise<IFileRows<T>[]> {
    const extracts: IFileRows = await this.fileService.readCsv(value)

    return [extracts]
  }

  async extractsExcel(value: IFile): Promise<IFileRows<T>[]> {
    const extracts: IFileRows[] = await this.fileService.readExcel(value, {
      password: value?.password,
    })

    return extracts
  }
}

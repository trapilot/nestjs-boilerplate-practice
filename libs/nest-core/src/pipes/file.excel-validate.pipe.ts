import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { PipeTransform } from '@nestjs/common/interfaces'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { AppException } from 'lib/nest-core'
import { IFileRows } from '../interfaces'

// only for excel
// must use after FileExtractPipe
@Injectable()
export class FileExcelValidatePipe<T, N = Record<string, any>> implements PipeTransform {
  constructor(private readonly dto: ClassConstructor<T>) {}

  async transform(value: IFileRows<N>[]): Promise<IFileRows<T>[]> {
    if (!value) {
      return
    }

    await this.validate(value)
    const dtos = await this.validateParse(value, this.dto)

    return dtos
  }

  async validate(value: IFileRows<N>[]): Promise<void> {
    if (!value || value.length === 0) {
      throw new UnprocessableEntityException({
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        message: 'file.error.requiredParseFirst',
      })
    }

    return
  }

  async validateParse(
    value: IFileRows<N>[],
    classDto: ClassConstructor<T>,
  ): Promise<IFileRows<T>[]> {
    const errors: ValidationError[] = []
    const dtos: IFileRows<T>[] = []

    for (const [index, parse] of value.entries()) {
      const rowData: T[] = plainToInstance(classDto, parse.data)
      const rowErrors: ValidationError[] = await validate(rowData)

      if (rowErrors.length > 0) {
        rowErrors.map((rowError) => {
          rowError.contexts.row = index
          rowError.contexts.sheetName = parse.sheetName
          return rowError
        })
        errors.push(...rowErrors)
      } else {
        dtos.push({
          sheetName: parse.sheetName,
          data: rowData,
        })
      }
    }

    if (errors.length > 0) {
      throw new AppException({
        message: 'file.error.validationDto',
        httpStatus: HttpStatus.UNPROCESSABLE_ENTITY,
        errors,
      })
    }

    return dtos
  }
}

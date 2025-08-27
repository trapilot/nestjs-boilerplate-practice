import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common'
import { PipeTransform } from '@nestjs/common/interfaces'
import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import { IMessageValidationImportErrorParam } from 'lib/nest-message'
import { FileImportException } from '../exceptions'
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
    classDtos: ClassConstructor<T>,
  ): Promise<IFileRows<T>[]> {
    const errors: IMessageValidationImportErrorParam[] = []
    const dtos: IFileRows<T>[] = []

    for (const [index, parse] of value.entries()) {
      const dto: T[] = plainToInstance(classDtos, parse.data)
      const validator: ValidationError[] = await validate(dto)

      if (validator.length > 0) {
        errors.push({
          row: index,
          sheetName: parse.sheetName,
          errors: validator,
        })
      } else {
        dtos.push({
          sheetName: parse.sheetName,
          data: dto,
        })
      }
    }

    if (errors.length > 0) {
      throw new FileImportException(errors)
    }

    return dtos
  }
}

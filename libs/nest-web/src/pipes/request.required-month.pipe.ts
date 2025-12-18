import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { DateService } from 'lib/nest-core'
import { EntityValidateException } from '../exceptions'

@Injectable()
export class RequestRequiredMonthPipe implements PipeTransform {
  constructor(protected readonly dateService: DateService) {}

  async transform(value: number, metadata: ArgumentMetadata): Promise<number> {
    const month = (value || '').toString().padStart(2, '0')
    if (!this.dateService.checkIso(`1000-${month}-01`)) {
      throw EntityValidateException.builder()
        .addError({ property: metadata.data, value: `request.isMonth|${value}` })
        .build()
    }

    return value
  }
}

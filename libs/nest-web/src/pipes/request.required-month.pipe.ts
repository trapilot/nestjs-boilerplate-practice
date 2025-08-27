import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { EntityValidateException, HelperDateService } from 'lib/nest-core'

@Injectable()
export class RequestRequiredMonthPipe implements PipeTransform {
  constructor(protected readonly helperDateService: HelperDateService) {}

  async transform(value: number, metadata: ArgumentMetadata): Promise<number> {
    const month = (value || '').toString().padStart(2, '0')
    if (!this.helperDateService.checkIso(`1000-${month}-01`)) {
      throw EntityValidateException.builder()
        .addError({ property: metadata.data, value: `request.isMonth|${value}` })
        .build()
    }

    return value
  }
}

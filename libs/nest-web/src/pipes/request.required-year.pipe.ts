import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { EntityValidateException, HelperDateService } from 'lib/nest-core'

@Injectable()
export class RequestRequiredYearPipe implements PipeTransform {
  constructor(protected readonly helperDateService: HelperDateService) {}

  async transform(value: number, metadata: ArgumentMetadata): Promise<number> {
    if (!this.helperDateService.checkIso(`${value}-01-01`)) {
      throw EntityValidateException.builder()
        .addError({ property: metadata.data, value: `request.isYear|${value}` })
        .build()
    }

    return value
  }
}

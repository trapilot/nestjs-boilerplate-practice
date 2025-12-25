import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common'
import { HelperService } from 'lib/nest-core'
import { EntityValidateException } from '../exceptions'

@Injectable()
export class RequestRequiredYearPipe implements PipeTransform {
  constructor(protected readonly helperService: HelperService) {}

  async transform(value: number, metadata: ArgumentMetadata): Promise<number> {
    if (!this.helperService.dateCheckIso(`${value}-01-01`)) {
      throw EntityValidateException.builder()
        .addError({ property: metadata.data, value: `request.isYear|${value}` })
        .build()
    }

    return value
  }
}

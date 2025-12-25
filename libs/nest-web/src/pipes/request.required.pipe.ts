import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common'

@Injectable()
export class RequestRequiredPipe implements PipeTransform {
  async transform(value: string, _metadata: ArgumentMetadata): Promise<string> {
    if (!value) {
      throw new BadRequestException()
    }

    return value
  }
}

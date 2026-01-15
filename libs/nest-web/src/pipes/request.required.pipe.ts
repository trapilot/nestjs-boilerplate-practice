import {
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
  Injectable,
  PipeTransform,
} from '@nestjs/common'

@Injectable()
export class RequestRequiredPipe implements PipeTransform {
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    if (!value) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'request.error.paramRequired',
        messageProperties: {
          property: metadata.data,
        },
      })
    }

    return value
  }
}

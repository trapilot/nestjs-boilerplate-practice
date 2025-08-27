import { BadRequestException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common'
import { TUser } from '../interfaces'

@Injectable()
export class UserStatusPipe implements PipeTransform {
  private readonly status: boolean

  constructor(status: boolean) {
    this.status = status
  }

  async transform(value: TUser): Promise<TUser> {
    if (this.status !== value.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.statusInvalid',
      })
    }
    return value
  }
}

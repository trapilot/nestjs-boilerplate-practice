import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { IRequestApp } from 'lib/nest-core'

@Injectable({ scope: Scope.REQUEST })
export class UserNotSelfPipe implements PipeTransform {
  constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

  async transform(value: number): Promise<number> {
    const { user: payload } = this.request
    if (payload.user.id === value) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.notSelf',
      })
    }
    return value
  }
}

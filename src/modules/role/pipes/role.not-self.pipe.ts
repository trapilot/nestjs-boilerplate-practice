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
export class RoleNotSelfPipe implements PipeTransform {
  constructor(@Inject(REQUEST) protected readonly request: IRequestApp) {}

  async transform(roleId: number): Promise<number> {
    const userRoles = this.request?.user?.user?.roles ?? []
    if (userRoles.length === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.abilityForbidden',
      })
    }
    if (userRoles.includes(roleId)) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.notSelf',
      })
    }

    return roleId
  }
}

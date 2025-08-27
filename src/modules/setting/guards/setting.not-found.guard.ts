import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Setting } from '@prisma/client'
import { IRequestApp } from 'lib/nest-core'

@Injectable()
export class SettingNotFoundGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { __setting } = context.switchToHttp().getRequest<IRequestApp & { __setting: Setting }>()

    if (!__setting) {
      throw new NotFoundException({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'module.setting.notFound',
      })
    }

    return true
  }
}

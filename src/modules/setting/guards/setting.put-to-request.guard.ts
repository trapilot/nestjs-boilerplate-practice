import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Setting } from '@runtime/prisma-client'
import { IRequestApp } from 'lib/nest-core'
import { SettingService } from '../services/setting.service'

@Injectable()
export class SettingPutToRequestGuard implements CanActivate {
  constructor(private readonly settingService: SettingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp & { __setting: Setting }>()
    const { params } = request
    const { id } = params

    const check = await this.settingService.getOne({ where: { id: +id } })
    request.__setting = check

    return true
  }
}

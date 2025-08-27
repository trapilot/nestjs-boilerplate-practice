import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Setting } from '@prisma/client'
import { IRequestApp } from 'lib/nest-core'
import { SettingService } from '../services'

@Injectable()
export class SettingPutToRequestGuard implements CanActivate {
  constructor(private readonly settingService: SettingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestApp & { __setting: Setting }>()
    const { params } = request
    const { id } = params

    const check: any = await this.settingService.findOne({ id: +id })
    request.__setting = check

    return true
  }
}

import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Setting } from '@runtime/prisma-client'
import { IRequestApp } from 'lib/nest-core'

export const GetSetting = createParamDecorator(<T>(data: string, context: ExecutionContext): T => {
  const { __setting } = context.switchToHttp().getRequest<IRequestApp & { __setting: Setting }>()
  return (data ? __setting[data] : __setting) as T
})

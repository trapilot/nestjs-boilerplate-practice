import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { IRequestApp } from 'lib/nest-core'

export const RequestRoleLevel = createParamDecorator(
  <T>(_data: string, context: ExecutionContext): T => {
    const { user } = context.switchToHttp().getRequest<IRequestApp>()
    const payload = user || undefined
    const userLevel = payload?.user?.level ?? Number.MAX_SAFE_INTEGER
    return { level: { gte: userLevel } } as T
  }
)

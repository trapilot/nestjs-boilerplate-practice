import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IRequestApp } from 'lib/nest-core'

export const RequestRoleLevel = createParamDecorator(
  <T>(_data: string, context: ExecutionContext): T => {
    const { user } = context.switchToHttp().getRequest<IRequestApp>()
    let payload = user || undefined
    const userLevel = payload?.user?.level ?? Number.MAX_SAFE_INTEGER
    return { level: { gte: userLevel } } as T
  },
)

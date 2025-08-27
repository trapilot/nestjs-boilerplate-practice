import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import { IRequestFile } from 'lib/nest-core'
import { UserService } from '../services'

@Injectable()
export class UserIsSuperAdmin implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<IRequestFile>()
    const { user: payload } = request
    if (payload && payload?.user?.id) {
      const userId = payload.user.id
      const userData = await this.userService.findOrFail(userId, {
        include: {
          pivotRoles: {
            select: { role: true },
          },
        },
      })

      for (const userWithRoles of userData.pivotRoles) {
        if (userWithRoles.role.level === 0) {
          return true
        }
      }
    }

    throw new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'auth.error.abilityForbidden',
    })
  }
}

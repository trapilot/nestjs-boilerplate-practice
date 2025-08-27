import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import { PrismaService } from 'lib/nest-prisma'
import { IRequestApp } from 'lib/nest-core'

@Injectable({ scope: Scope.REQUEST })
export class RoleLimitedLevelPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) protected readonly request: IRequestApp,
    private readonly prisma: PrismaService,
  ) {}

  async transform(roleId: number): Promise<number> {
    const userLevel = this.request?.user?.user?.level ?? Number.MAX_SAFE_INTEGER
    const role = await this.prisma.role.findUnique({ where: { id: roleId } })

    if (role.level < userLevel) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.scopePredefinedNotFound',
      })
    }

    return roleId
  }
}

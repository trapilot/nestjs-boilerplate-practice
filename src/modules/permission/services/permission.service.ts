import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList } from 'lib/nest-web'
import { TPermission } from '../interfaces'

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.PermissionFindUniqueArgs): Promise<TPermission> {
    return await this.prisma.permission.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.PermissionFindFirstArgs = {}): Promise<TPermission> {
    return await this.prisma.permission.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.PermissionFindManyArgs = {}): Promise<TPermission[]> {
    return await this.prisma.permission.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.PermissionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPermission> {
    return await this.prisma.permission
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.permission.notFound',
        })
      })
  }

  async list(
    where?: Prisma.PermissionWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.permission.list(where, params, options)
    })
  }

  async update(
    id: number,
    data: Prisma.PermissionUncheckedUpdateInput,
    kwargs: Omit<Prisma.PermissionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPermission> {
    const permission = await this.findOrFail(id, { include: { pivotRoles: true } })
    const rolePerms = permission?.pivotRoles ?? []

    const updated = await this.prisma.$transaction(async (tx) => {
      const bitwise = Number(data.bitwise)
      for (const rolePerm of rolePerms) {
        const roleBitwise = rolePerm.bitwise & bitwise
        const roleWhere: Prisma.RolesPermissionsWhereUniqueInput = {
          permissionId_roleId: {
            permissionId: rolePerm.permissionId,
            roleId: rolePerm.roleId,
          },
        }

        if (roleBitwise === 0) {
          await tx.rolesPermissions.delete({ where: roleWhere })
        } else {
          await tx.rolesPermissions.update({
            data: { bitwise: roleBitwise },
            where: roleWhere,
          })
        }
      }

      return await tx.permission.update({
        ...kwargs,
        data,
        where: { id: permission.id },
      })
    })
    return updated
  }

  async create(
    data: Prisma.PermissionUncheckedCreateInput,
    kwargs: Omit<Prisma.PermissionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPermission> {
    const created = await this.prisma.permission.create({
      ...kwargs,
      data,
    })
    return created
  }
}

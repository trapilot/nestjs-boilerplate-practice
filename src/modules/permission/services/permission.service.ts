import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { IPrismaExportOptions, IPrismaReturnList, PrismaService } from 'lib/nest-prisma'
import { TPermission } from '../interfaces/permission.interface'

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.PermissionFindUniqueArgs): Promise<TPermission> {
    return await this.prisma.permission.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.PermissionFindFirstArgs): Promise<TPermission> {
    return await this.prisma.permission.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.PermissionFindManyArgs): Promise<TPermission[]> {
    return await this.prisma.permission.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.PermissionFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.permission.list(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.PermissionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPermission> {
    return await this.prisma.permission
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.permission.notFound',
        })
      })
  }

  async update(
    id: number,
    data: Prisma.PermissionUncheckedUpdateInput,
    kwargs: Omit<Prisma.PermissionFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TPermission> {
    const permission = await this.findOrFail(id, { include: { pivotRoles: true } })
    const rolePerms = permission?.pivotRoles ?? []

    const updated = await this.prisma.$transaction(async tx => {
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

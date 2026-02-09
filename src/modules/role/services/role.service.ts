import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { UserAbilityUtil } from 'app/helpers/user.ability.util'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TPermission } from 'modules/permission/interfaces/permission.interface'
import { IRoleCreateOptions, IRoleUpdateOptions, TRole } from '../interfaces/role.interface'

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.RoleFindUniqueArgs): Promise<TRole> {
    return await this.prisma.role.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.RoleFindFirstArgs): Promise<TRole> {
    return await this.prisma.role.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.RoleFindManyArgs): Promise<TRole[]> {
    return await this.prisma.role.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.RoleFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.role.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.RoleFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.role.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.RoleFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TRole> {
    return await this.prisma.role
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.role.notFound',
        })
      })
  }

  async create(
    data: Prisma.RoleUncheckedCreateInput,
    options?: IRoleCreateOptions,
  ): Promise<TRole> {
    const permissions = options?.permissions ?? []
    const rolePermissions = []
    for (const p of permissions) {
      const roleBit = UserAbilityUtil.map2Bitwise(p.actions)
      const perm = await this.prisma.permission.findUnique({ where: { subject: p.subject } })
      if (perm) {
        rolePermissions.push({ permissionId: perm.id, bitwise: roleBit })
      }
    }

    const created = await this.prisma.role.create({
      data: {
        ...data,
        pivotPermissions: {
          createMany: {
            data: rolePermissions,
            skipDuplicates: true,
          },
        },
      },
    })
    return created
  }

  async update(
    id: number,
    data: Prisma.RoleUncheckedUpdateInput,
    options?: IRoleUpdateOptions,
  ): Promise<TRole> {
    const role = await this.findOrFail(id, {
      include: {
        pivotPermissions: { select: { permissionId: true } },
      },
    })

    const newPermissions = options?.permissions ?? []
    const rolePermissions = []
    for (const p of newPermissions) {
      const roleBit = UserAbilityUtil.map2Bitwise(p.actions)
      const perm = await this.prisma.permission.findUnique({ where: { subject: p.subject } })
      if (perm) {
        rolePermissions.push({ permissionId: perm.id, bitwise: roleBit })
      }
    }

    const updated = await this.prisma.$transaction(async tx => {
      await tx.rolesPermissions.deleteMany({ where: { roleId: role.id } })
      await tx.rolesPermissions.createMany({
        data: rolePermissions.map(perm => {
          return {
            bitwise: perm.bitwise,
            permissionId: perm.permissionId,
            roleId: role.id,
          }
        }),
      })
      return await tx.role.update({
        data: { updatedAt: options?.updatedAt, ...data },
        where: { id: role.id },
        include: {
          pivotPermissions: {
            include: { permission: true },
          },
        },
      })
    })
    return updated
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.role.delete({ where: { id } })
      return true
    } catch (_err: unknown) {}
    return false
  }

  async change(id: number, data: Prisma.RoleUncheckedUpdateInput): Promise<TRole> {
    const role = await this.findOrFail(id)
    return await this.prisma.role.update({
      data,
      where: { id: role.id },
    })
  }

  async deleteAll(): Promise<boolean> {
    await this.prisma.role.deleteMany()
    return true
  }

  async getWithAllPerms(id?: number): Promise<[TRole, TPermission[]]> {
    const getFulLPermsFn = this.prisma.permission.findMany({
      where: { isActive: true },
      orderBy: [{ sorting: 'asc' }],
    })

    if (id) {
      return await Promise.all([
        this.findOrFail(id, { include: { pivotPermissions: true } }),
        getFulLPermsFn,
      ])
    }
    return await Promise.all([this.fakeNew(), getFulLPermsFn])
  }

  private fakeNew(): TRole {
    return {
      id: 0,
      level: 0,
      title: '',
      description: '',
      isActive: true,
      deletedAt: null,
      createdAt: null,
      updatedAt: null,
      createdBy: null,
      updatedBy: null,
    }
  }
}

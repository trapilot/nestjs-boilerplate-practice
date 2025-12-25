import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { ENUM_APP_ABILITY_ACTION, ENUM_APP_ABILITY_SUBJECT } from 'shared/enums'
import { UserAbilityUtil } from 'shared/helpers'
import { IRoleCreateOptions, IRoleUpdateOptions, TRole } from '../interfaces'

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.RoleFindUniqueArgs): Promise<TRole> {
    return await this.prisma.role.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.RoleFindFirstArgs = {}): Promise<TRole> {
    return await this.prisma.role.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.RoleFindManyArgs = {}): Promise<TRole[]> {
    return await this.prisma.role.findMany(kwargs)
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

  async differOrFail(
    where: Prisma.RoleWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.role.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.RoleWhereInput,
    kwargs: Omit<Prisma.RoleFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TRole> {
    const role = await this.prisma.role
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.role.notFound',
        })
      })
    return role
  }

  async list(
    where?: Prisma.RoleWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.role.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.RoleWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.role.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.RoleWhereInput): Promise<number> {
    return await this.prisma.role.count({
      where,
    })
  }

  async create(
    data: Prisma.RoleUncheckedCreateInput,
    options?: IRoleCreateOptions,
  ): Promise<TRole> {
    const permissions = options?.permissions ?? []
    const rolePermissions = []
    for (const p of permissions) {
      const { subject, bitwise: roleBit } = UserAbilityUtil.toPermission(p.subject, p.actions)
      const perm = await this.prisma.permission.findUnique({ where: { subject } })
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
      const { subject, bitwise: roleBit } = UserAbilityUtil.toPermission(p.subject, p.actions)
      const perm = await this.prisma.permission.findUnique({ where: { subject } })
      if (perm) {
        rolePermissions.push({ permissionId: perm.id, bitwise: roleBit })
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.rolesPermissions.deleteMany({ where: { roleId: role.id } })
      await tx.rolesPermissions.createMany({
        data: rolePermissions.map((perm) => {
          return {
            bitwise: perm.bitwise,
            permissionId: perm.permissionId,
            roleId: role.id,
          }
        }),
      })
      return await tx.role.update({
        data,
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
    } catch (_err: any) {}
    return false
  }

  async change(id: number, data: Prisma.RoleUncheckedUpdateInput): Promise<TRole> {
    const role = await this.findOrFail(id)
    return await this.prisma.role.update({
      data,
      where: { id: role.id },
    })
  }

  async generate<T = Prisma.PermissionUncheckedCreateInput>(
    subject: ENUM_APP_ABILITY_SUBJECT,
    actions: ENUM_APP_ABILITY_ACTION[],
  ): Promise<T> {
    return UserAbilityUtil.toPermission<T>(subject, actions)
  }

  async deleteAll(): Promise<boolean> {
    await this.prisma.role.deleteMany()
    return true
  }

  fakeNew(): TRole {
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

import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { EnumAuthSignUpFrom } from 'lib/nest-auth'
import { FileUtil, HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { RoleService } from 'modules/role/services/role.service'
import { IUserCreatedOptions, IUserUpdateOptions, TUser } from '../interfaces/user.interface'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly roleService: RoleService,
  ) {}

  async getOne(kwargs: Prisma.UserFindUniqueArgs): Promise<TUser> {
    return await this.prisma.user.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.UserFindFirstArgs): Promise<TUser> {
    return await this.prisma.user.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.UserFindManyArgs): Promise<TUser[]> {
    return await this.prisma.user.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.UserFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.user.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.UserFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.user.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.UserFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TUser> {
    return await this.prisma.user
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.user.notFound',
        })
      })
  }

  async create(
    data: Prisma.UserUncheckedCreateInput,
    options?: IUserCreatedOptions,
  ): Promise<TUser> {
    try {
      if (options?.roleId) {
        const role = await this.roleService.findOrFail(options.roleId)
        data.level = role.level
        data.pivotRoles = {
          createMany: {
            data: [{ roleId: role.id }],
            skipDuplicates: true,
          },
        }
      }

      const { region, phone } = this.helperService.parsePhone(data.phone)

      return await this.prisma.user.create({
        data: {
          ...data,
          phoneRegion: region,
          phoneNumber: phone,
          isActive: true,
          signUpFrom: EnumAuthSignUpFrom.CMS,
        },
      })
    } catch (err: unknown) {
      FileUtil.removeLink(data?.avatar)
      throw err
    }
  }

  async update(
    id: number,
    data: Prisma.UserUncheckedUpdateInput,
    options?: IUserUpdateOptions,
  ): Promise<TUser> {
    const user = await this.findOrFail(id)

    if (options?.roleId) {
      const role = await this.roleService.findOrFail(options.roleId)
      data.level = role.level
    }

    const { region, phone } = this.helperService.parsePhone(`${data.phone}`)

    return await this.prisma.$transaction(async tx => {
      if (options?.roleId) {
        await tx.usersRoles.deleteMany({ where: { userId: user.id } })
        await tx.usersRoles.create({ data: { userId: user.id, roleId: options.roleId } })
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          ...data,
          phoneRegion: region,
          phoneNumber: phone,
          updatedAt: options?.updatedAt,
        },
      })
      return updated
    })
  }

  async changeAvatar(user: TUser, data: Prisma.UserUncheckedUpdateInput): Promise<TUser> {
    return await this.prisma.user.update({
      data,
      where: { id: user.id },
    })
  }

  async getActivities(
    kwargs?: Prisma.UserActivityFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.userActivity.list(kwargs, options)
  }
}

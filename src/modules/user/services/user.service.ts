import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { ENUM_AUTH_SIGN_UP_FROM, IAuthPassword } from 'lib/nest-auth'
import { FileService, HelperService } from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { RoleService } from '../../role/services'
import { IUserCreatedOptions, IUserUpdateOptions, TUser } from '../interfaces'

@Injectable()
export class UserService implements OnModuleInit {
  private roleService: RoleService
  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
    private readonly helperService: HelperService,
  ) {}

  onModuleInit() {
    this.roleService = this.ref.get(RoleService, { strict: false })
  }

  async findOne(kwargs?: Prisma.UserFindUniqueArgs): Promise<TUser> {
    return await this.prisma.user.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.UserFindFirstArgs = {}): Promise<TUser> {
    return await this.prisma.user.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.UserFindManyArgs = {}): Promise<TUser[]> {
    return await this.prisma.user.findMany(kwargs)
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

  async differOrFail(
    where: Prisma.UserWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.user.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.UserWhereInput,
    kwargs: Omit<Prisma.UserFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TUser> {
    const user = await this.prisma.user
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.user.notFound',
        })
      })
    return user
  }

  async list(
    where?: Prisma.UserWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.user.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.UserWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.user.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.UserWhereInput): Promise<number> {
    return await this.prisma.user.count({
      where,
    })
  }

  async create(
    data: Prisma.UserUncheckedCreateInput,
    { passwordHash }: IAuthPassword,
    options?: IUserCreatedOptions,
  ): Promise<TUser> {
    try {
      await this.differOrFail({ phone: data.phone })

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

      const { country, phone } = this.helperService.parsePhone(data.phone)

      return await this.prisma.user.create({
        data: {
          ...data,
          phoneCountry: country,
          phoneNumber: phone,
          isActive: true,
          signUpFrom: ENUM_AUTH_SIGN_UP_FROM.CMS,
          password: passwordHash,
        },
      })
    } catch (err: any) {
      this.fileService.unlink(data?.avatar)
      throw err
    }
  }

  async update(
    id: number,
    data: Prisma.UserUncheckedUpdateInput,
    options?: IUserUpdateOptions,
  ): Promise<TUser> {
    const user = await this.findOrFail(id)

    await this.differOrFail({
      phone: `${data.phone}`,
      id: { not: user.id },
    })

    if (options?.roleId) {
      const role = await this.roleService.findOrFail(options.roleId)
      data.level = role.level
    }

    const { country, phone } = this.helperService.parsePhone(`${data.phone}`)

    return await this.prisma.$transaction(async (tx) => {
      if (options?.roleId) {
        await tx.usersRoles.deleteMany({ where: { userId: user.id } })
        await tx.usersRoles.create({ data: { userId: user.id, roleId: options.roleId } })
      }

      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          ...data,
          phoneCountry: country,
          phoneNumber: phone,
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

  async getLoginHistories(
    where?: Prisma.UserLoginHistoryWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.userLoginHistory.list(where, params, options)
    })
  }
}

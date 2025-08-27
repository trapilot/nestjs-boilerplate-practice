import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { T<%= singular(classify(name)) %> } from '../interfaces'

@Injectable()
export class <%= singular(classify(name)) %>Service {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(kwargs?: Prisma.<%= singular(classify(name)) %>FindUniqueArgs): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.<%= singular(classify(name)) %>FindFirstArgs = {}): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.<%= singular(classify(name)) %>FindManyArgs = {}): Promise<T<%= singular(classify(name)) %>[]> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.<%= singular(classify(name)) %>FindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<T<%= singular(classify(name)) %>> {
    const <%= singular(lowercased(name)) %> = await this.prisma.<%= singular(lowercased(name)) %>
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.<%= singular(lowercased(name)) %>.notFound',
        })
      })
    return <%= singular(lowercased(name)) %>
  }

  async matchOrFail(
    where: Prisma.<%= singular(classify(name)) %>WhereInput,
    kwargs: Omit<Prisma.<%= singular(classify(name)) %>FindFirstOrThrowArgs, 'where'> = {},
  ): Promise<T<%= singular(classify(name)) %>> {
    const <%= singular(lowercased(name)) %> = await this.prisma.<%= singular(lowercased(name)) %>
      .findFirstOrThrow({ ...kwargs, where })
      .catch((err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.<%= singular(lowercased(name)) %>.notFound',
        })
      })
    return <%= singular(lowercased(name)) %>
  }

  async differOrFail(
    where: Prisma.<%= singular(classify(name)) %>WhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.<%= singular(lowercased(name)) %>.conflict',
      })
    }
  }

  async list(
    where?: Prisma.<%= singular(classify(name)) %>WhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponseList> {
    return await this.prisma.$listing(async (ex) => {
      return await ex.<%= singular(lowercased(name)) %>.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.<%= singular(classify(name)) %>WhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$paginate(async (ex) => {
      return await ex.<%= singular(lowercased(name)) %>.paginate(where, params, options)
    })
  }

  async count(where?: Prisma.<%= singular(classify(name)) %>WhereInput): Promise<number> {
    return await this.prisma.<%= singular(lowercased(name)) %>.count({
      where,
    })
  }

  async find(id: number, kwargs: Omit<Prisma.<%= singular(classify(name)) %>FindUniqueArgs, 'where'> = {}): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.<%= singular(classify(name)) %>UncheckedCreateInput): Promise<T<%= singular(classify(name)) %>> {
    const <%= singular(lowercased(name)) %> = await this.prisma.<%= singular(lowercased(name)) %>.create({
      data,
    })
    return <%= singular(lowercased(name)) %>
  }

  async update(id: number, data: Prisma.<%= singular(classify(name)) %>UncheckedUpdateInput): Promise<T<%= singular(classify(name)) %>> {
    const <%= singular(lowercased(name)) %> = await this.findOrFail(id)

    return await this.prisma.<%= singular(lowercased(name)) %>.update({
      data,
      where: { id: <%= singular(lowercased(name)) %>.id },
    })
  }

  async delete(<%= singular(lowercased(name)) %>: T<%= singular(classify(name)) %>, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.<%= singular(lowercased(name)) %>.delete({ where: { id: <%= singular(lowercased(name)) %>.id } })
      })
      return true
    } catch {
      return false
    }
  }
}

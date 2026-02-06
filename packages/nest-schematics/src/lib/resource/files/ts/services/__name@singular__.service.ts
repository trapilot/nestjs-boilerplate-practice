import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { T<%= singular(classify(name)) %> } from '../interfaces/<%= singular(lowercased(name)) %>.interface'

@Injectable()
export class <%= singular(classify(name)) %>Service {
  constructor(private readonly prisma: PrismaService) {}

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.<%= singular(classify(name)) %>FindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<T<%= singular(classify(name)) %>> {
    const <%= singular(lowercased(name)) %> = await this.prisma.<%= singular(lowercased(name)) %>
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
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
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.<%= singular(lowercased(name)) %>.notFound',
        })
      })
    return <%= singular(lowercased(name)) %>
  }

  async list(
    where?: Prisma.<%= singular(classify(name)) %>WhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.<%= singular(lowercased(name)) %>.list(where, params, options)
  }

  async paginate(
    where?: Prisma.<%= singular(classify(name)) %>WhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.<%= singular(lowercased(name)) %>.paginate(where, params, options)
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

  async delete(id: number, deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.<%= singular(lowercased(name)) %>.delete({ where: { id } })
      })
      return true
    } catch {
      return false
    }
  }
}

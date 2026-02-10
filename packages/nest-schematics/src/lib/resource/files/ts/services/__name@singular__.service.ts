import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { T<%= singular(classify(name)) %> } from '../interfaces/<%= singular(name) %>.interface'

@Injectable()
export class <%= singular(classify(name)) %>Service {
  constructor(private readonly prisma: PrismaService) {}

  async getOne(kwargs: Prisma.<%= singular(classify(name)) %>FindUniqueArgs): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.<%= singular(classify(name)) %>FindFirstArgs): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.<%= singular(classify(name)) %>FindManyArgs): Promise<T<%= singular(classify(name)) %>[]> {
    return await this.prisma.<%= singular(lowercased(name)) %>.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.<%= singular(classify(name)) %>FindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.<%= singular(lowercased(name)) %>.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.<%= singular(classify(name)) %>FindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.<%= singular(lowercased(name)) %>.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.<%= singular(classify(name)) %>FindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<T<%= singular(classify(name)) %>> {
    return await this.prisma.<%= singular(lowercased(name)) %>
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.<%= singular(lowercased(name)) %>.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
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

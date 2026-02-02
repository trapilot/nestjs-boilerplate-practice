import { ConflictException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { TMemberPoint } from '../interfaces/member-point.interface'

@Injectable()
export class MemberPointService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async findOne(kwargs?: Prisma.MemberPointFindUniqueArgs): Promise<TMemberPoint> {
    return await this.prisma.memberPoint.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberPointFindFirstArgs = {}): Promise<TMemberPoint> {
    return await this.prisma.memberPoint.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberPointFindManyArgs = {}): Promise<TMemberPoint[]> {
    return await this.prisma.memberPoint.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberPointFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMemberPoint> {
    const pointHistory = await this.prisma.memberPoint
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberPoint.notFound',
        })
      })
    return pointHistory
  }

  async matchOrFail(
    where: Prisma.MemberPointWhereInput,
    kwargs: Omit<Prisma.MemberPointFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TMemberPoint> {
    const pointHistory = await this.prisma.memberPoint
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberPoint.notFound',
        })
      })
    return pointHistory
  }

  async differOrFail(
    where: Prisma.MemberPointWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.memberPoint.conflict',
      })
    }
  }

  async list(
    where?: Prisma.MemberPointWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberPoint.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberPointWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberPoint.paginate(where, params, options)
  }

  async count(where?: Prisma.MemberPointWhereInput): Promise<number> {
    return await this.prisma.memberPoint.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberPointFindUniqueArgs, 'where'> = {},
  ): Promise<TMemberPoint> {
    return await this.prisma.memberPoint.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(data: Prisma.MemberPointUncheckedCreateInput): Promise<TMemberPoint> {
    const pointHistory = await this.prisma.memberPoint.create({
      data,
    })
    return pointHistory
  }

  async update(id: number, data: Prisma.MemberPointUncheckedUpdateInput): Promise<TMemberPoint> {
    const pointHistory = await this.findOrFail(id)

    return await this.prisma.memberPoint.update({
      data,
      where: { id: pointHistory.id },
    })
  }

  async delete(pointHistory: TMemberPoint, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberPoint.delete({ where: { id: pointHistory.id } })
      })
      return true
    } catch {
      return false
    }
  }

  async sumMemberActivePoints(memberId: number, untilDate?: Date): Promise<number> {
    untilDate = untilDate || this.helperService.dateNow()

    const aggregate = await this.prisma.memberPoint.aggregate({
      _sum: { point: true },
      where: {
        memberId,
        isActive: true,
        isDeleted: false,
        isPending: false,
        expiryDate: { gte: untilDate },
        createdAt: { lte: untilDate },
      },
    })
    return aggregate._sum.point || 0
  }

  async getMemberRecentPoints(
    memberId: number,
    options?: { pointRequire?: number; untilDate?: Date },
  ): Promise<{ date: Date; point: number }[]> {
    const untilDate = options?.untilDate || this.helperService.dateNow()

    const pointGroups = await this.prisma.memberPoint.groupBy({
      by: ['expiryDate'],
      _sum: { point: true },
      having: { point: { _sum: { gt: 0 } } },
      where: {
        memberId,
        isActive: true,
        isDeleted: false,
        isPending: false,
        expiryDate: { gte: untilDate },
        createdAt: { lte: untilDate },
      },
      orderBy: { expiryDate: 'asc' },
    })

    const results: { date: Date; point: number }[] = []

    if (options?.pointRequire) {
      if (options.pointRequire <= 0) {
        return []
      }

      let remaining = options.pointRequire

      for (const group of pointGroups) {
        if (remaining <= 0) {
          break
        }

        const available = group._sum.point ?? 0
        const deduct = Math.min(remaining, available)

        if (deduct > 0) {
          results.push({
            date: group.expiryDate,
            point: deduct,
          })
          remaining -= deduct
        }
      }
    } else {
      for (const group of pointGroups) {
        results.push({
          date: group.expiryDate,
          point: group._sum.point || 0,
        })
      }
    }

    return results
  }
}

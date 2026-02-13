import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import {
  EnumPointAction,
  EnumPointOrigin,
  EnumPointReason,
  EnumSchemaRewardType,
  Prisma,
} from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import {
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { EnumPointSchemaTrigger } from 'modules/point-schema/enums/point-schema.enum'
import { TPointSchema } from 'modules/point-schema/interfaces/point-schema.interface'
import { PointSchemaService } from 'modules/point-schema/services/point-schema.service'
import { TierService } from 'modules/tier/services/tier.service'
import {
  IMemberPointApplyTierRewardOptions,
  IMemberPointHandleTriggerOptions,
  TMemberPoint,
} from '../interfaces/member-point.interface'

@Injectable()
export class MemberPointService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly tierService: TierService,
    private readonly pointSchemaService: PointSchemaService,
  ) {}

  async getOne(kwargs: Prisma.MemberPointFindUniqueArgs): Promise<TMemberPoint> {
    return await this.prisma.memberPoint.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.MemberPointFindFirstArgs): Promise<TMemberPoint> {
    return await this.prisma.memberPoint.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.MemberPointFindManyArgs): Promise<TMemberPoint[]> {
    return await this.prisma.memberPoint.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.MemberPointFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.memberPoint.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.MemberPointFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.memberPoint.paginate(kwargs, options)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberPointFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMemberPoint> {
    return await this.prisma.memberPoint
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.memberPoint.notFound',
        })
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

  async delete(id: number, _deletedBy?: number): Promise<boolean> {
    try {
      await this.prisma.$transaction(async tx => {
        await tx.memberPoint.delete({ where: { id } })
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
        createdAt: { lte: untilDate },
        OR: [{ expiryDate: null }, { expiryDate: { gte: untilDate } }],
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

  private async handleTrigger(
    trigger: EnumPointSchemaTrigger,
    options: IMemberPointHandleTriggerOptions,
  ): Promise<void> {
    const schemas = await this.pointSchemaService.getAllByTrigger(trigger, options.issuedAt)

    for (const schema of schemas) {
      const canApply = await this.pointSchemaService.check(schema, {
        memberId: options.memberId,
        issuedAt: options.issuedAt,
        compareValue: options.compareValue,
      })

      if (canApply) {
        await this.applySchemaRewards(schema, options)
      }
    }
  }

  private async applySchemaRewards(
    schema: TPointSchema,
    options: IMemberPointHandleTriggerOptions,
  ): Promise<void> {
    const nowDate = this.helperService.dateNow()

    for (const reward of schema.rewards) {
      const grantPoint =
        reward.type === EnumSchemaRewardType.MULTIPLIER
          ? reward.value * options.basePoint
          : reward.type === EnumSchemaRewardType.GRANT
            ? reward.value
            : 0

      if (grantPoint > 0) {
        await this.prisma.$transaction(async tx => {
          const member = await tx.member.update({
            where: { id: options.memberId },
            data: {
              pointBalance: { increment: grantPoint },
              updatedAt: nowDate,
            },
            select: {
              id: true,
              pointBalance: true,
            },
          })

          await tx.memberPoint.create({
            data: {
              schemaId: schema.id,
              memberId: member.id,
              tierId: options.tierId,
              reason: options.reason,
              point: grantPoint,
              pointBalance: member.pointBalance,
              origin: EnumPointOrigin.SCHEMA,
              action: EnumPointAction.PLUS,
              createdAt: nowDate,
              updatedAt: nowDate,
            },
          })
        })
      }
    }
  }

  async applyTierReward(options: IMemberPointApplyTierRewardOptions): Promise<void> {
    const tier = await this.tierService.findOrFail(options.tierId)

    await this.handleTrigger(EnumPointSchemaTrigger.WELCOME_TIER, {
      memberId: options.memberId,
      tierId: options.tierId,
      issuedAt: options.issuedAt,
      basePoint: 0,
      reason: EnumPointReason.WELCOME,
      compareValue: tier.code,
    })
  }
}

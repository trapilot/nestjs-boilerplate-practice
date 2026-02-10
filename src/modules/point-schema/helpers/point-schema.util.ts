import { Injectable } from '@nestjs/common'
import {
  EnumSchemaConditionOperator,
  EnumSchemaConditionType,
  EnumSchemaLimitType,
} from '@runtime/prisma-client'
import { EnumDateFormat, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import {
  IPointSchemaContext,
  TPointSchema,
  TPointSchemaCondition,
} from '../interfaces/point-schema.interface'

@Injectable()
export class PointSchemaUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async canApply(schema: TPointSchema, context: IPointSchemaContext): Promise<boolean> {
    if (!this.matchConditions(schema.conditions, context)) {
      return false
    }

    if (await this.reachLimit(schema, context)) {
      return false
    }

    return true
  }

  private matchConditions(
    conditions: TPointSchemaCondition[],
    context: IPointSchemaContext,
  ): boolean {
    return conditions.every(cond => {
      switch (cond.type) {
        case EnumSchemaConditionType.AMOUNT:
          return this.compare<number>(Number(context.compareValue), cond.floatValue, cond.operator)

        case EnumSchemaConditionType.COUNT:
          return this.compare<number>(Number(context.compareValue), cond.intValue, cond.operator)

        case EnumSchemaConditionType.VALUE:
          return this.compare<string>(`${context.compareValue}`, cond.stringValue, cond.operator)

        case EnumSchemaConditionType.DATE_MATCH:
          const dateChk = this.helperService.dateCreateFromGeneric(context.compareValue)
          const dateOne = this.helperService.dateFormat(dateChk, EnumDateFormat.MONTH_DATE)
          const dateTwo = this.helperService.dateFormat(cond.dateValue, EnumDateFormat.MONTH_DATE)
          return dateOne === dateTwo

        case EnumSchemaConditionType.TIME_RANGE:
          const hourChk = this.helperService.dateCreateFromGeneric(context.compareValue).getHours()
          const hourParts = cond.stringValue.split(':').map(Number)
          if (hourParts.length === 2) {
            const [hourOne, hourTwo] = hourParts
            return hourChk >= hourOne && hourChk < hourTwo
          }
        default:
          return false
      }
    })
  }

  private compare<T = string | number>(
    left: T,
    right: T,
    operator: EnumSchemaConditionOperator,
  ): boolean {
    switch (operator) {
      case EnumSchemaConditionOperator.EQ:
        return left === right
      case EnumSchemaConditionOperator.GT:
        return left > right
      case EnumSchemaConditionOperator.GTE:
        return left >= right
      case EnumSchemaConditionOperator.LT:
        return left < right
      case EnumSchemaConditionOperator.LTE:
        return left <= right
      default:
        return false
    }
  }

  private async reachLimit(schema: TPointSchema, context: IPointSchemaContext): Promise<boolean> {
    if (!schema.limits?.length) {
      return false
    }

    const rangeDate = this.helperService.dateRange(context.issuedAt)

    for (const limit of schema.limits) {
      switch (limit.type) {
        case EnumSchemaLimitType.ONCE_PER_LIFE:
          return await this.prisma.memberPoint.exists({
            where: {
              schemaId: schema.id,
              memberId: context.memberId,
            },
          })

        case EnumSchemaLimitType.ONCE_PER_DAY:
          return await this.prisma.memberPoint.exists({
            where: {
              schemaId: schema.id,
              memberId: context.memberId,
              createdAt: { gte: rangeDate.startOfDay, lte: rangeDate.endOfDay },
            },
          })

        case EnumSchemaLimitType.ONCE_PER_MONTH:
          return await this.prisma.memberPoint.exists({
            where: {
              schemaId: schema.id,
              memberId: context.memberId,
              createdAt: { gte: rangeDate.startOfMonth, lte: rangeDate.endOfMonth },
            },
          })

        case EnumSchemaLimitType.ONCE_PER_YEAR:
          return await this.prisma.memberPoint.exists({
            where: {
              schemaId: schema.id,
              memberId: context.memberId,
              createdAt: { gte: rangeDate.startOfYear, lte: rangeDate.endOfYear },
            },
          })

        case EnumSchemaLimitType.MAX_TIMES:
          if (limit.maxTimes) {
            const total = await this.prisma.memberPoint.count({
              where: {
                schemaId: schema.id,
                memberId: context.memberId,
              },
            })
            return total >= limit.maxTimes
          }

        default:
          return false
      }
    }

    return false
  }
}

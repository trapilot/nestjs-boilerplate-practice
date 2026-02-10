import { ConfigService } from '@nestjs/config'
import {
  EnumSchemaConditionOperator,
  EnumSchemaConditionType,
  EnumSchemaLimitType,
  EnumSchemaRewardType,
} from '@runtime/prisma-client'
import { CommandMigrateBase, EnumTierCode } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumPointSchemaTrigger } from 'modules/point-schema/enums/point-schema.enum'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:point-schema',
  description: 'Seed point schemas',
})
export class PointSchemaSeed extends CommandMigrateBase {
  private readonly startDate: Date

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super()

    this.startDate = this.config.get<Date>('app.startDate')
  }

  async up(): Promise<void> {
    for (const schema of this.welcomeTiers) {
      await this.prisma.pointSchema.create({
        data: {
          trigger: EnumPointSchemaTrigger.WELCOME_TIER,
          sinceDate: this.startDate,
          createdAt: this.startDate,
          updatedAt: this.startDate,
          conditions: {
            create: {
              type: EnumSchemaConditionType.VALUE,
              operator: EnumSchemaConditionOperator.EQ,
              stringValue: schema.tierCode,
            },
          },
          rewards: { create: { type: EnumSchemaRewardType.GRANT, value: schema.point } },
          limits: { create: { type: EnumSchemaLimitType.ONCE_PER_LIFE } },
        },
      })
    }
  }

  async down(): Promise<void> {
    await this.prisma.pointSchema.deleteMany({
      where: {
        trigger: {
          in: Object.values(EnumPointSchemaTrigger),
        },
      },
    })
  }

  private get welcomeTiers(): { tierCode: EnumTierCode; point: number }[] {
    return [
      { tierCode: EnumTierCode.NORMAL, point: 50 },
      { tierCode: EnumTierCode.BRONZE, point: 100 },
      { tierCode: EnumTierCode.SILVER, point: 200 },
      { tierCode: EnumTierCode.GOLD, point: 300 },
      { tierCode: EnumTierCode.BLACK, point: 400 },
      { tierCode: EnumTierCode.PLATINUM, point: 500 },
      { tierCode: EnumTierCode.DIAMOND, point: 600 },
    ]
  }
}

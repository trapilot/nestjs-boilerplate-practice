import { ConfigService } from '@nestjs/config'
import { EnumRateRule, EnumTransitionRule, Prisma } from '@runtime/prisma-client'
import { CommandMigrateBase, EnumAppLanguage, EnumTierCode } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:tier',
  description: 'Seed tiers',
})
export class TierSeed extends CommandMigrateBase {
  private readonly startDate: Date

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super()

    this.startDate = this.config.get<Date>('app.startDate')
  }

  async up(): Promise<void> {
    let level = 10
    const keepExcess = false
    for (const tier of this.dtos) {
      await this.prisma.tier.upsert({
        where: { code: tier.code },
        create: {
          ...tier,
          level,
          keepExcess,
          createdAt: this.startDate,
          updatedAt: this.startDate,
        },
        update: { ...tier, level, keepExcess },
      })
      level += 10
    }

    const dbTiers = await this.prisma.tier.findMany({
      orderBy: [{ level: 'asc' }],
    })

    const downMulti = true
    const upMulti = false

    for (const currTier of dbTiers) {
      for (const nextTier of dbTiers) {
        let isActive = currTier.level === nextTier.level

        isActive ||= downMulti
          ? currTier.level - nextTier.level >= 1
          : currTier.level - nextTier.level === 1

        isActive ||= upMulti
          ? nextTier.level - currTier.level >= 1
          : nextTier.level - currTier.level === 1

        await this.prisma.tierTransition.upsert({
          where: {
            prevTierId_nextTierId_rule: {
              prevTierId: currTier.id,
              nextTierId: nextTier.id,
              rule: EnumTransitionRule.AMOUNT,
            },
          },
          create: {
            prevTierId: currTier.id,
            nextTierId: nextTier.id,
            rule: EnumTransitionRule.AMOUNT,
            value: this.amounts[nextTier.code],
          },
          update: {
            prevTierId: currTier.id,
            nextTierId: nextTier.id,
            rule: EnumTransitionRule.AMOUNT,
            value: this.amounts[nextTier.code],
          },
        })
      }
    }
  }

  async down(): Promise<void> {
    await this.prisma.tier.deleteMany()
  }

  private get amounts() {
    return {
      [EnumTierCode.NORMAL]: 0,
      [EnumTierCode.BRONZE]: 20_000,
      [EnumTierCode.SILVER]: 50_000,
      [EnumTierCode.GOLD]: 100_000,
      [EnumTierCode.BLACK]: 500_000,
      [EnumTierCode.PLATINUM]: 1_000_000,
      [EnumTierCode.DIAMOND]: 2_000_000,
    }
  }

  private get dtos(): Prisma.TierUncheckedCreateInput[] {
    return [
      {
        isActive: true,
        code: EnumTierCode.NORMAL,
        name: {
          [EnumAppLanguage.EN]: 'Normal',
          [EnumAppLanguage.VI]: 'Normal',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
      {
        isActive: true,
        code: EnumTierCode.BRONZE,
        name: {
          [EnumAppLanguage.EN]: 'Bronze',
          [EnumAppLanguage.VI]: 'Bronze',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
      {
        isActive: true,
        code: EnumTierCode.SILVER,
        name: {
          [EnumAppLanguage.EN]: 'Silver',
          [EnumAppLanguage.VI]: 'Silver',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
      {
        isActive: true,
        code: EnumTierCode.GOLD,
        name: {
          [EnumAppLanguage.EN]: 'Gold',
          [EnumAppLanguage.VI]: 'Gold',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
      {
        isActive: true,
        code: EnumTierCode.BLACK,
        name: {
          [EnumAppLanguage.EN]: 'Black',
          [EnumAppLanguage.VI]: 'Black',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
      {
        isActive: true,
        code: EnumTierCode.PLATINUM,
        name: {
          [EnumAppLanguage.EN]: 'Platinum',
          [EnumAppLanguage.VI]: 'Platinum',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
      {
        isActive: true,
        code: EnumTierCode.DIAMOND,
        name: {
          [EnumAppLanguage.EN]: 'Platinum',
          [EnumAppLanguage.VI]: 'Platinum',
        },
        rates: {
          createMany: {
            data: [
              { rule: EnumRateRule.PERSONAL, value: 20, priority: 0 },
              { rule: EnumRateRule.REFERRAL, value: 20, priority: 0 },
              { rule: EnumRateRule.FIRST_PURCHASE, value: 10, priority: 0 },
            ],
            skipDuplicates: true,
          },
        },
      },
    ]
  }
}

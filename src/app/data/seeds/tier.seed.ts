import { ConfigService } from '@nestjs/config'
import { Prisma } from '@runtime/prisma-client'
import { CommandMigrateBase, EnumAppLanguage, EnumTierCode } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command } from 'nest-commander'

@Command({
  name: 'seed:tier',
  description: 'Seed tiers',
})
export class TierSeed extends CommandMigrateBase {
  private readonly startDate: Date
  private readonly dtos: Prisma.TierUncheckedCreateInput[] = []

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super()

    this.startDate = this.config.get<Date>('app.startDate')
    this.dtos = [
      {
        code: EnumTierCode.NORMAL,
        name: {
          [EnumAppLanguage.EN]: 'Normal',
          [EnumAppLanguage.VI]: 'Normal',
        },
        rewardPoint: 0,
        limitSpending: 0,
        initialRate: 10,
        personalRate: 20,
        referralRate: 20,
        birthdayRatio: 2,
      },
      {
        code: EnumTierCode.BLUE,
        name: {
          [EnumAppLanguage.EN]: 'Blue',
          [EnumAppLanguage.VI]: 'Blue',
        },
        rewardPoint: 100,
        limitSpending: 18_000,
        initialRate: 10,
        personalRate: 20,
        referralRate: 20,
        birthdayRatio: 2,
      },
      {
        code: EnumTierCode.GOLD,
        name: {
          [EnumAppLanguage.EN]: 'Gold',
          [EnumAppLanguage.VI]: 'Gold',
        },
        rewardPoint: 200,
        limitSpending: 68_000,
        initialRate: 10,
        personalRate: 20,
        referralRate: 20,
        birthdayRatio: 2,
      },
      {
        code: EnumTierCode.BLACK,
        name: {
          [EnumAppLanguage.EN]: 'Black',
          [EnumAppLanguage.VI]: 'Black',
        },
        rewardPoint: 300,
        limitSpending: 500_000,
        initialRate: 10,
        personalRate: 20,
        referralRate: 20,
        birthdayRatio: 3,
      },
      {
        code: EnumTierCode.PLATINUM,
        name: {
          [EnumAppLanguage.EN]: 'Platinum',
          [EnumAppLanguage.VI]: 'Platinum',
        },
        rewardPoint: 400,
        limitSpending: 1_000_000,
        initialRate: 10,
        personalRate: 20,
        referralRate: 20,
        birthdayRatio: 3,
      },
    ]
  }

  async up(): Promise<void> {
    let level = 0
    const alive = false
    for (const tier of this.dtos) {
      await this.prisma.tier.upsert({
        where: { code: tier.code },
        create: { ...tier, level, alive, createdAt: this.startDate, updatedAt: this.startDate },
        update: { ...tier, level, alive },
      })
      level++
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

        await this.prisma.tierChart.upsert({
          where: {
            currId_nextId: {
              currId: currTier.id,
              nextId: nextTier.id,
            },
          },
          create: {
            isActive,
            currId: currTier.id,
            nextId: nextTier.id,
            requireSpending: nextTier.limitSpending,
          },
          update: {
            isActive,
            requireSpending: nextTier.limitSpending,
          },
        })
      }
    }
  }

  async down(): Promise<void> {}
}

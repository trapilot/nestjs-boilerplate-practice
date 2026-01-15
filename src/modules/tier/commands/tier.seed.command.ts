import { Prisma } from '@runtime/prisma-client'
import {
  EnumAppLanguage,
  EnumScopeType,
  EnumTierCode,
  HelperService,
  LoggerService,
  ScopeAsync,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'

@Command({
  name: 'tier:seed',
  description: 'Seed tiers',
})
export class TierSeedCommand extends CommandRunner {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  @ScopeAsync(EnumScopeType.COMMAND, { context: 'seed' })
  async run(): Promise<void> {
    this.logger.log(`${TierSeedCommand.name} is running...`)

    try {
      await this.seed()
    } catch (err: any) {
      this.logger.error(err)
    } finally {
      this.logger.log(`${TierSeedCommand.name} stoped`)
    }
    return
  }

  async seed() {
    const nowDate = this.helperService.dateNow()
    const tiers: Prisma.TierUncheckedCreateInput[] = [
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

    let level = 0
    const alive = false
    for (const tier of tiers) {
      await this.prisma.tier.upsert({
        where: { code: tier.code },
        create: { ...tier, level, alive, createdAt: nowDate, updatedAt: nowDate },
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
}

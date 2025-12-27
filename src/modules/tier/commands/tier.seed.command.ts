import { Logger } from '@nestjs/common'
import { Prisma } from '@runtime/prisma-client'
import { ENUM_APP_LANGUAGE, ENUM_TIER_CODE, HelperService, NEST_CLI } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner } from 'nest-commander'

@Command({
  name: 'tier:seed',
  description: 'Seed tiers',
})
export class TierSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {
    super()
  }

  async run(): Promise<void> {
    this.logger.warn(`${TierSeedCommand.name} is running...`)

    try {
      const dateNow = this.helperService.dateCreate()
      const tiers: Prisma.TierUncheckedCreateInput[] = [
        {
          code: ENUM_TIER_CODE.NORMAL,
          name: {
            [ENUM_APP_LANGUAGE.EN]: 'Normal',
            [ENUM_APP_LANGUAGE.VI]: 'Normal',
          },
          rewardPoint: 0,
          limitSpending: 0,
          initialRate: 10,
          personalRate: 20,
          referralRate: 20,
          birthdayRatio: 2,
        },
        {
          code: ENUM_TIER_CODE.BLUE,
          name: {
            [ENUM_APP_LANGUAGE.EN]: 'Blue',
            [ENUM_APP_LANGUAGE.VI]: 'Blue',
          },
          rewardPoint: 100,
          limitSpending: 18_000,
          initialRate: 10,
          personalRate: 20,
          referralRate: 20,
          birthdayRatio: 2,
        },
        {
          code: ENUM_TIER_CODE.GOLD,
          name: {
            [ENUM_APP_LANGUAGE.EN]: 'Gold',
            [ENUM_APP_LANGUAGE.VI]: 'Gold',
          },
          rewardPoint: 200,
          limitSpending: 68_000,
          initialRate: 10,
          personalRate: 20,
          referralRate: 20,
          birthdayRatio: 2,
        },
        {
          code: ENUM_TIER_CODE.BLACK,
          name: {
            [ENUM_APP_LANGUAGE.EN]: 'Black',
            [ENUM_APP_LANGUAGE.VI]: 'Black',
          },
          rewardPoint: 300,
          limitSpending: 500_000,
          initialRate: 10,
          personalRate: 20,
          referralRate: 20,
          birthdayRatio: 3,
        },
        {
          code: ENUM_TIER_CODE.PLATINUM,
          name: {
            [ENUM_APP_LANGUAGE.EN]: 'Platinum',
            [ENUM_APP_LANGUAGE.VI]: 'Platinum',
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
          create: { ...tier, level, alive, createdAt: dateNow, updatedAt: dateNow },
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
    } catch (err: any) {
      throw err
    }
    return
  }
}

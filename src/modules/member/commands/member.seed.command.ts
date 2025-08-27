import { faker } from '@faker-js/faker'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ENUM_MEMBER_TIER_ACTION, ENUM_MEMBER_TYPE } from '@prisma/client'
import {
  ENUM_APP_LANGUAGE,
  ENUM_GENDER_TYPE,
  HelperCryptoService,
  HelperDateService,
  HelperStringService,
  NEST_CLI,
  NestHelper,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { Command, CommandRunner, Option } from 'nest-commander'
import { TierService } from 'src/modules/tier/services'

@Command({
  name: 'member:seed',
  description: 'Seed members',
})
export class MemberSeedCommand extends CommandRunner {
  private readonly logger = new Logger(NEST_CLI)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tierService: TierService,
    private readonly helperDateService: HelperDateService,
    private readonly helperStringService: HelperStringService,
    private readonly helperCryptoService: HelperCryptoService,
  ) {
    super()
  }

  async run(passedParam: string[], options?: any): Promise<void> {
    this.logger.warn(`${MemberSeedCommand.name} is running...`)
    if (NestHelper.isProduction()) {
      return
    }

    const dateNow = this.helperDateService.create()
    const startDate = this.config.get<Date>('app.startDate')
    const codeDigits = this.config.getOrThrow<number>('app.membership.codeDigits')

    const chartIterator = this.tierService.getChartIterator()
    const dateRange = this.helperDateService.createRange(dateNow)

    const passwordSaltLength = this.config.get<number>('auth.password.saltLength')
    const passwordSalt = this.helperCryptoService.randomSalt(passwordSaltLength)
    const hashedPassword = this.helperCryptoService.bcrypt(
      process.env.MOCK_MEMBER_PASS,
      passwordSalt,
    )

    try {
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=0`
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE members`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE member_tier_histories`)
      await this.prisma.$queryRawUnsafe(`TRUNCATE TABLE member_point_histories`)
      await this.prisma.$queryRaw`SET FOREIGN_KEY_CHECKS=1`

      // let members: Prisma.MemberUncheckedCreateInput[] = []

      const referralCodes = []
      for (let i = 0; i < options.numbers; i++) {
        const isStaff = faker.datatype.boolean()
        const isFemale = faker.datatype.boolean()
        const memberTier = isStaff ? chartIterator.getStaffTier() : chartIterator.getNormalTier()
        const tierData = chartIterator.getTierStats(memberTier.id)

        const fullPhone = faker.phone.number({ style: 'international' })
        const { country, phone } = this.helperStringService.parsePhone(fullPhone)

        const code = this.helperStringService.padZero(i + 1, codeDigits, 'T')
        const invitedCode = referralCodes[Math.floor(Math.random() * referralCodes.length)]
        const hasReferrer = faker.datatype.boolean()

        let referralCode = faker.string.alpha({ length: 10, casing: 'upper' })
        while (referralCodes.includes(referralCode)) {
          referralCode = faker.string.alpha({ length: 10, casing: 'upper' })
          // referralCode = fullPhone
        }
        referralCodes.push(referralCode)

        const memberDate = isStaff
          ? this.helperDateService.create(new Date('2099-12-31'), { endOfDay: true })
          : dateRange.endOfYear
        const birthDate = faker.date.birthdate({ mode: 'age', min: 20, max: 70 })
        const dateOfBirth = this.helperDateService.create(birthDate, { startOfDay: true })
        const extractDate = this.helperDateService.extract(dateOfBirth)
        const expiryDate = this.helperDateService.create(memberDate, { endOfDay: true })

        await this.prisma.member.create({
          data: {
            code,
            tierId: memberTier.id,
            minTierId: memberTier.id,
            referralCode,
            invitedCode: hasReferrer ? invitedCode : undefined,
            type: isStaff ? ENUM_MEMBER_TYPE.STAFF : ENUM_MEMBER_TYPE.NORMAL,
            email: faker.internet.email(),
            name: faker.person.lastName(),
            phone: i === 0 ? process.env.MOCK_MEMBER_PHONE : fullPhone,
            password: hashedPassword,
            phoneCountry: country,
            phoneNumber: phone,
            address: faker.location.streetAddress(true),
            locale: ENUM_APP_LANGUAGE.EN,
            gender: isFemale ? ENUM_GENDER_TYPE.FEMALE : ENUM_GENDER_TYPE.MALE,
            birthDate,
            expiryDate,
            birthDay: extractDate.day,
            birthMonth: extractDate.month,
            birthYear: extractDate.year,
            isActive: true,
            isNotifiable: false,
            isPromotable: false,
            isEmailVerified: true,
            isPhoneVerified: true,
            hasFirstPurchased: false,
            hasBirthPurchased: false,
            hasDiamondAchieved: false,
            maximumSpending: tierData.next.limitSpending,
            personalSpending: 0,
            referralSpending: 0,
            startedAt: startDate,
            createdAt: startDate,
            updatedAt: startDate,
            tierHistories: {
              create: {
                minTierId: memberTier.id,
                prevTierId: memberTier.id,
                currTierId: memberTier.id,
                type: ENUM_MEMBER_TIER_ACTION.INITIAL,
                renewalSpending: tierData.curr.limitSpending,
                upgradeSpending: tierData.next.limitSpending,
                expiryDate,
                isActive: true,
                createdAt: startDate,
                updatedAt: startDate,
              },
            },
          },
        })

        // if (members.length === 500 || i === options.numbers - 1) {
        //   await this.prisma.$executeRaw(PrismaHelper.buildBulkInsert(members, tableName))
        //   members = []
        // }
      }

      /*
      const chunkNotTierMembers = 500
      const whereNotTierMembers: Prisma.MemberWhereInput = {
        tierHistories: { none: {} },
      }
      let memberTierHistories: Prisma.MemberTierHistoryUncheckedCreateInput[] = []
      let running = false
      do {
        const notTierMembers = await this.prisma.member.findMany({
          where: whereNotTierMembers,
          take: chunkNotTierMembers,
          select: { id: true, minTierId: true, expiryDate: true },
        })
        for (const notImportMember of notTierMembers) {
          memberTierHistories.push({
            memberId: notImportMember.id,
            minTierId: notImportMember.minTierId,
            prevTierId: tierData.info.id,
            currTierId: tierData.info.id,
            personalSpending: 0,
            referralSpending: 0,
            remainPersonalSpending: tierData.next.limitSpending,
            remainReferralSpending: tierData.next.limitSpending,
            renewalSpending: tierData.curr.limitSpending,
            upgradeSpending: tierData.next.limitSpending,
            expiryDate: notImportMember.expiryDate,
            isActive: true,
            createdAt: startedAt,
            updatedAt: startedAt,
          })

          if (memberTierHistories.length === 500) {
            await this.prisma.$executeRaw(
              PrismaHelper.buildBulkInsert(memberTierHistories, tableTierName),
            )
            memberTierHistories = []
          }
        }
        running = notTierMembers.length === chunkNotTierMembers
      } while (running)
      await this.prisma.$executeRaw(
        PrismaHelper.buildBulkInsert(memberTierHistories, tableTierName),
      )
      */
    } catch (err: any) {
      throw new Error(err.message)
    }

    return
  }

  @Option({
    flags: '-i, --numbers [number]',
    description: 'Number of products to generate',
    required: true,
  })
  parseNumber(val: string): number {
    return Number(val)
  }
}

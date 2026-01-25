import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumMemberType, EnumTierHistoryMethod } from '@runtime/prisma-client'
import { AuthUtil } from 'lib/nest-auth'
import {
  EnumCountryCode,
  EnumUserType,
  HelperService,
  MESSAGE_LANGUAGES,
  ScheduleMockupBase,
  StrUtil
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { MemberUtil } from 'modules/member'
import { TierService } from 'modules/tier'

@Injectable()
export class MemberMock extends ScheduleMockupBase {
  private readonly startDate: Date
  private readonly mockupNumbers: number = 1000
  private remainNumbers: number = null

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly tierService: TierService,
    private readonly helperService: HelperService,
    private readonly authUtil: AuthUtil,
    private readonly memberUtil: MemberUtil
  ) {
    super()

    this.startDate = this.config.get<Date>('app.startDate')
  }

  async mockup(): Promise<void> {
    const remainNumbers = await this.getRemainNumbers()
    const mockupNumbers = Math.min(this.mockupNumbers, remainNumbers)

    if (mockupNumbers <= 0) {return}

    const lastMember = await this.prisma.member.findFirst({
      orderBy: [{ id: 'desc' }],
      select: { id: true, createdAt: true },
    })

    const deviceModels = ['iPhone', 'Samsung Galaxy', 'Samsung Note', 'Xiaomi']
    const deviceVersions = ['5', '6', '7', '8', '9', '10', '11', '12']
    const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Michael', 'Sarah', 'Andy', 'Mihawk', 'Lix', 'Lisa', 'Shark']
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Ed', 'Parker', 'Anna', 'Wex', 'Yay', 'Kyn']
    const streetNames = ['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln']
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Seul', 'Tokyo', 'Shanghai']
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'AX', 'YY', 'TW', 'AT', 'IG']
    const countries = Object.values(EnumCountryCode)
    const locales = MESSAGE_LANGUAGES

    const dateCheck = lastMember ? lastMember.createdAt : this.startDate
    const dateExecute = this.helperService.dateForward(dateCheck, {
      days: this.helperService.randomNumber({ min: 0, max: 2 }),
    })
    const tierChart = this.tierService.getChart()
    const dateRange = this.helperService.dateRange(dateExecute)
    const staffDate = this.helperService.dateForward(this.startDate, { years: 100 })
    const { passwordHash } = this.authUtil.createPassword(process.env.MOCK_MEMBER_PASS)

    const referralCodes = []
    const startNumber = lastMember?.id ?? 0
    for (let i = 0; i < mockupNumbers; i++) {
      const nextNumber = startNumber + i
      const isStaff = this.helperService.randomBoolean(5)
      const isFemale = !this.helperService.randomNumber({ min: 0, max: 1 })
      const memberTier = isStaff ? tierChart.getStaffTier() : tierChart.getNormalTier()
      const tierData = tierChart.getStats(memberTier.id)

      const randCountry = this.helperService.arrayRandom(countries)
      const fullPhone = this.helperService.randomDigits(10 - randCountry.length, {
        prefix: randCountry,
      })
      const { country, phone } = this.helperService.parsePhone(fullPhone)

      const memberCode = this.memberUtil.generateCode(nextNumber)
      const invitedCode = referralCodes[Math.floor(Math.random() * referralCodes.length)]
      const hasReferrer = this.helperService.randomBoolean(10)

      const referralCode = this.helperService.baseEncode(`${memberCode}${fullPhone}`, 36)
      referralCodes.push(referralCode)

      const memberDate = isStaff
        ? this.helperService.dateCreate(staffDate, { endOfDay: true })
        : dateRange.endOfYear
      const birthDate = this.helperService.randomBirthDate(20, 60)
      const dateOfBirth = this.helperService.dateCreate(birthDate, { startOfDay: true })
      const extractDate = this.helperService.dateExtract(dateOfBirth)
      const expiryDate = this.helperService.dateCreate(memberDate, { endOfDay: true })

      await this.prisma.member.create({
        data: {
          code: memberCode,
          tierId: memberTier.id,
          minTierId: memberTier.id,
          referralCode,
          invitedCode: hasReferrer ? invitedCode : undefined,
          type: isStaff ? EnumMemberType.STAFF : EnumMemberType.NORMAL,
          email:
            this.helperService.mixinString([lastNames, firstNames], {
              delimiter: '_',
              format: 'lowercase',
              suffix: this.helperService.randomDigits(4),
            }) +
            this.helperService.mixinString(
              [
                ['gmail', 'apple', 'domain', 'test', 'develop', 'x-mail', 'x-networks', 'x.ip6'],
                ['com', 'net', 'vn', 'io', 'info', 'org', 'in', 'uk'],
              ],
              {
                delimiter: '.',
                format: 'lowercase',
                prefix: '@',
              }
            ),
          name: this.helperService.mixinString([firstNames, lastNames], { delimiter: ' ' }),
          phone: i === 0 ? process.env.MOCK_MEMBER_PHONE : fullPhone,
          password: passwordHash,
          phoneCountry: country,
          phoneNumber: phone,
          address: this.helperService.mixinString([streetNames, cities, states], {
            delimiter: ', ',
            prefix: this.helperService.randomDigits(3, { suffix: ' ' }),
            suffix: this.helperService.randomDigits(5, { prefix: ' ' }),
          }),
          locale: this.helperService.arrayRandom(locales),
          gender: isFemale ? EnumUserType.FEMALE : EnumUserType.MALE,
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
          startedAt: dateExecute,
          createdAt: dateExecute,
          updatedAt: dateExecute,
          deviceHistories: {
            create:{
              type: 'mobile',
              model: this.helperService.mixinString([deviceModels,deviceVersions], {delimiter: ' '}),
              version: this.helperService.arrayRandom(deviceVersions),
              token: this.helperService.randomString(16),
              isActive: this.helperService.randomBoolean(5)
            }
          },
          tierHistories: {
            create: {
              minTierId: memberTier.id,
              prevTierId: memberTier.id,
              currTierId: memberTier.id,
              type: EnumTierHistoryMethod.INITIAL,
              renewalSpending: tierData.curr.limitSpending,
              upgradeSpending: tierData.next.limitSpending,
              expiryDate,
              isActive: true,
              createdAt: dateExecute,
              updatedAt: dateExecute,
            },
          },
        },
      })
    }
  }

  async mockable(): Promise<boolean> {
    const remainNumbers = await this.getRemainNumbers()
    return remainNumbers > 0
  }

  async getRemainNumbers(): Promise<number> {
    if (this.remainNumbers === null) {
      const limitMembers = StrUtil.numeric(process.env.AUTO_GEN_MEMBER_NUMB, 0)
      if (limitMembers <= 0) {return 0}

      const totalMembers = await this.prisma.member.count()
      this.remainNumbers = Math.max(0, limitMembers - totalMembers)
    }
    return this.remainNumbers
  }
}

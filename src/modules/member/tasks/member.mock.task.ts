import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumMemberType, EnumTierHistoryMethod } from '@runtime/prisma-client'
import {
  CryptoService,
  EnumAppLanguage,
  EnumScopeType,
  EnumUserType,
  HelperService,
  LoggerService,
  ScopeAsync,
  StrUtil,
} from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { TierService } from 'modules/tier'

@Injectable()
export class MemberMockTask {
  private readonly nowDate: Date
  private readonly startDate: Date
  private readonly mockupNumbers: number = 1000

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly crypto: CryptoService,
    private readonly tierService: TierService,
    private readonly helperService: HelperService
  ) {
    this.nowDate = this.helperService.dateNow()
    this.startDate = this.config.get<Date>('app.startDate')
  }

  @Cron(CronExpression.EVERY_MINUTE, {
    disabled: StrUtil.isNotTrue(process.env.AUTO_GEN_MODE),
  })
  @ScopeAsync(EnumScopeType.CRON, {
    context: 'cron.member_mockup',
  })
  async mockup(): Promise<void> {
    this.logger.log(`${MemberMockTask.name} is running`)
    const remainNumbers = await this.runWithNumbers()
    if (remainNumbers <= 0) {
      this.logger.warn(`${MemberMockTask.name} stopped`)
      return
    }

    const mockupNumbers = Math.min(this.mockupNumbers, remainNumbers)
    const lastMember = await this.prisma.member.findFirst({
      orderBy: [{ createdAt: 'desc' }],
      select: { createdAt: true },
    })

    const dateCheck = lastMember ? lastMember.createdAt : this.startDate

    const dateExecute = this.helperService.dateForward(dateCheck, {
      days: this.helperService.randomNumberInRange(1, 2),
    })
    const codeDigits = this.config.getOrThrow<number>('module.member.codeDigits')
    const tierChart = this.tierService.getChart()
    const dateRange = this.helperService.dateRange(this.nowDate)
    const passwordSaltLength = this.config.get<number>('auth.password.saltLength')
    const passwordSalt = this.crypto.randomSalt(passwordSaltLength)
    const hashedPassword = this.crypto.bcrypt(process.env.MOCK_MEMBER_PASS, passwordSalt)

    try {
      const referralCodes = []
      for (let i = 0; i < mockupNumbers; i++) {
        const staffNumber = this.helperService.randomNumberInRange(0, 5)
        const isStaff = staffNumber === 0
        const isFemale = !this.helperService.randomNumberInRange(0, 1)
        const memberTier = isStaff ? tierChart.getStaffTier() : tierChart.getNormalTier()
        const tierData = tierChart.getStats(memberTier.id)

        const fullPhone = this.helperService.padZero(i + 1, 8, 'CODE#')
        const { country, phone } = this.helperService.parsePhone(fullPhone)

        const code = this.helperService.padZero(i + 1, codeDigits, 'T')
        const invitedCode = referralCodes[Math.floor(Math.random() * referralCodes.length)]
        const hasReferrer = !this.helperService.randomNumberInRange(0, 1)

        const referralCode = fullPhone
        referralCodes.push(referralCode)

        const memberDate = isStaff
          ? this.helperService.dateCreate(new Date('2099-12-31'), { endOfDay: true })
          : dateRange.endOfYear
        const birthDate = new Date(Date.now() - 40 * 12 * 30000 * 3600)
        const dateOfBirth = this.helperService.dateCreate(birthDate, { startOfDay: true })
        const extractDate = this.helperService.dateExtract(dateOfBirth)
        const expiryDate = this.helperService.dateCreate(memberDate, { endOfDay: true })

        await this.prisma.member.create({
          data: {
            code,
            tierId: memberTier.id,
            minTierId: memberTier.id,
            referralCode,
            invitedCode: hasReferrer ? invitedCode : undefined,
            type: isStaff ? EnumMemberType.STAFF : EnumMemberType.NORMAL,
            email: `payx${i + 1}@email.cc.co`,
            name: `Pay X${i + 1}`,
            phone: i === 0 ? process.env.MOCK_MEMBER_PHONE : fullPhone,
            password: hashedPassword,
            phoneCountry: country,
            phoneNumber: phone,
            address: `home #0${i + 1}`,
            locale: EnumAppLanguage.EN,
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
    } catch (err: unknown) {
      this.logger.error(err)
    } finally {
      this.logger.warn(`${MemberMockTask.name} done`)
    }

    return
  }

  private async runWithNumbers(): Promise<number> {
    const limitMembers = StrUtil.numeric(process.env.AUTO_GEN_MEMBER_NUMB, 0)
    if (limitMembers <= 0) {
      return 0
    }

    const totalMembers = await this.prisma.member.count()
    return limitMembers - totalMembers
  }
}

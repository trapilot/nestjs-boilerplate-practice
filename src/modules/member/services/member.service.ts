import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import {
  EnumMemberType,
  EnumPointHistoryType,
  EnumSlipType,
  EnumTierHistoryMethod,
  Member,
  Prisma,
} from '@runtime/prisma-client'
import { IAuthPassword } from 'lib/nest-auth'
import {
  APP_LANGUAGE,
  EnumDateFormat,
  HelperService,
  MessageService,
  NumberUtil,
  ScopeContext,
} from 'lib/nest-core'
import {
  IPrismaOptions,
  IPrismaParams,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { InvoiceUtil } from 'modules/invoice'
import { TierService, TierUtil } from 'modules/tier'
import { MEMBER_AUTH_TOKEN } from '../constants'
import { MemberChangePasswordRequestDto } from '../dtos'
import { MemberAuth, MemberData, MemberUtil } from '../helpers'
import { ISlipCounterOptions, TMember, TMemberMetadata } from '../interfaces'

@Injectable()
export class MemberService implements OnModuleInit {
  private memberAuth: MemberAuth
  private invoiceUtil!: InvoiceUtil

  constructor(
    private readonly ref: ModuleRef,
    private readonly prisma: PrismaService,
    private readonly message: MessageService,
    private readonly helperService: HelperService,
    private readonly memberUtil: MemberUtil,
    private readonly tierService: TierService,
  ) {}

  onModuleInit(): void {
    this.memberAuth = this.ref.get(MEMBER_AUTH_TOKEN, { strict: true })
    this.invoiceUtil = this.ref.get(InvoiceUtil, { strict: false })
  }

  async findOne(kwargs?: Prisma.MemberFindUniqueArgs): Promise<TMember> {
    return await this.prisma.member.findUnique(kwargs)
  }

  async findFirst(kwargs: Prisma.MemberFindFirstArgs = {}): Promise<TMember> {
    return await this.prisma.member.findFirst(kwargs)
  }

  async findAll(kwargs: Prisma.MemberFindManyArgs = {}): Promise<TMember[]> {
    return await this.prisma.member.findMany(kwargs)
  }

  async findOrFail(
    id: number,
    kwargs: Omit<Prisma.MemberFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<TMember> {
    return await this.prisma.member
      .findUniqueOrThrow({ ...kwargs, where: { id } })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.member.notFound',
        })
      })
  }

  async differOrFail(
    where: Prisma.MemberWhereInput,
    options?: { limit?: number; message?: string },
  ): Promise<void> {
    const totalRecords = await this.count(where)
    const limitRecords = options?.limit ?? 0
    if (totalRecords > limitRecords) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        message: options?.message ?? 'module.member.conflict',
      })
    }
  }

  async matchOrFail(
    where: Prisma.MemberWhereInput,
    kwargs: Omit<Prisma.MemberFindFirstOrThrowArgs, 'where'> = {},
  ): Promise<TMember> {
    const member = await this.prisma.member
      .findFirstOrThrow({ ...kwargs, where })
      .catch((_err: unknown) => {
        throw new NotFoundException({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'module.member.notFound',
        })
      })
    return member
  }

  async list(
    where?: Prisma.MemberWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.member.list(where, params, options)
  }

  async paginate(
    where?: Prisma.MemberWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.member.paginate(where, params, options)
  }

  async count(where: Prisma.MemberWhereInput = {}): Promise<number> {
    return await this.prisma.member.count({
      where,
    })
  }

  async find(
    id: number,
    kwargs: Omit<Prisma.MemberFindUniqueArgs, 'where'> = {},
  ): Promise<TMember> {
    return await this.prisma.member.findUnique({
      ...kwargs,
      where: { id },
    })
  }

  async create(
    data: Prisma.MemberUncheckedCreateInput,
    authPassword: IAuthPassword,
  ): Promise<TMember> {
    await this.differOrFail({
      OR: [{ phone: data?.phone }, { email: data?.email }],
    })

    if (data?.birthDate) {
      const dateOfBirth = this.helperService.dateCreateFromGeneric(data.birthDate)
      const extractDate = this.helperService.dateExtract(dateOfBirth)
      data.birthDay = extractDate.day
      data.birthMonth = extractDate.month
      data.birthYear = extractDate.year
    }

    const nowDate = this.helperService.dateNow()
    const { endOfYear } = this.helperService.dateRange(nowDate)
    const { country, phone } = this.helperService.parsePhone(data.phone)
    const { id: tierId } = this.tierService.getChart().getNormalTier()

    const member = await this.prisma.member.create({
      data: {
        tierId: tierId,
        minTierId: tierId,
        type: EnumMemberType.NORMAL,
        expiryDate: endOfYear,
        locale: APP_LANGUAGE,
        phoneCountry: country,
        phoneNumber: phone,
        startedAt: nowDate,
        isEmailVerified: false,
        isPhoneVerified: false,
        password: authPassword.passwordHash,
        createdAt: nowDate,
        updatedAt: nowDate,
        ...data,
        tierHistories: {
          createMany: {
            data: [
              {
                prevTierId: tierId,
                currTierId: tierId,
                isActive: true,
                type: EnumTierHistoryMethod.INITIAL,
                expiryDate: endOfYear,
                createdAt: nowDate,
                updatedAt: nowDate,
              },
            ],
            skipDuplicates: true,
          },
        },
      },
    })
    return await this.handleCreated(member)
  }

  async update(id: number, data: Prisma.MemberUncheckedUpdateInput): Promise<TMember> {
    const member = await this.findOrFail(id)

    await this.differOrFail({
      phone: `${data?.phone}`,
      id: { not: member.id },
    })

    const { country, phone } = this.helperService.parsePhone(`${data?.phone}`)

    return await this.prisma.member.update({
      data: {
        ...data,
        phoneCountry: country,
        phoneNumber: phone,
      },
      where: { id: member.id },
    })
  }

  async inactive(id: number): Promise<TMember> {
    const member = await this.findOrFail(id)
    return await this.prisma.member.update({
      data: { isActive: false },
      where: { id: member.id },
    })
  }

  async active(id: number): Promise<TMember> {
    const member = await this.findOrFail(id)
    return await this.prisma.member.update({
      data: { isActive: true },
      where: { id: member.id },
    })
  }

  async turnOffNotify(id: number): Promise<TMember> {
    const member = await this.findOrFail(id)
    return await this.prisma.member.update({
      data: { isNotifiable: false },
      where: { id: member.id },
    })
  }

  async turnOnNotify(id: number): Promise<TMember> {
    const member = await this.findOrFail(id)
    return await this.prisma.member.update({
      data: { isNotifiable: true },
      where: { id: member.id },
    })
  }

  async changeAvatar(member: TMember, data: Prisma.MemberUncheckedUpdateInput): Promise<TMember> {
    return await this.prisma.member.update({
      data,
      where: { id: member.id },
    })
  }

  async changePassword(member: TMember, dto: MemberChangePasswordRequestDto): Promise<TMember> {
    return await this.memberAuth.changePassword(member, dto)
  }

  async addPoint(id: number, data: { point: number; createdBy: number }): Promise<Member> {
    const member = await this.findOrFail(id)

    const nowDate = this.helperService.dateNow()

    return await this.prisma.member.update({
      where: { id },
      data: {
        pointBalance: { increment: data.point },
        updatedAt: nowDate,
        pointHistories: {
          create: {
            point: data.point,
            createdBy: data.createdBy,
            tierId: member.tierId,
            type: EnumPointHistoryType.SYSTEM,
            createdAt: nowDate,
            updatedAt: nowDate,
          },
        },
      },
    })
  }

  async closeProfile(id: number, reasons?: string[]): Promise<boolean> {
    const member = await this.find(id)
    if (member && member?.isActive) {
      // clear all personal information and associated data
      const nowDate = this.helperService.dateNow()
      const timestamp = this.helperService.dateGetTimestamp(nowDate)
      await this.prisma.member.update({
        data: {
          isActive: false,
          email: this.helperService.dirtyString(member.email, timestamp),
          phone: this.helperService.dirtyString(member.phone, timestamp),
          deleteReasons: {
            createMany: {
              data: reasons.map((reason: string) => {
                return {
                  title: reason,
                  createdAt: nowDate,
                }
              }),
              skipDuplicates: true,
            },
          },
        },
        where: { id },
      })
    }
    return true
  }

  async editProfile(
    id: number,
    dto: Prisma.MemberUncheckedUpdateInput,
  ): Promise<TMember & TMemberMetadata> {
    const member = await this.findOrFail(id)
    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: dto,
    })
    const profile = await this.getProfile(updated.id)
    return profile
  }

  async handleCreated(member: TMember): Promise<TMember> {
    const expiryDate = this.memberUtil.getTierExpirationDate(member.createdAt)

    return await this.prisma.member.update({
      where: { id: member.id },
      data: {
        code: this.memberUtil.generateCode(member.id),
        expiryDate: expiryDate,
        updatedAt: member.updatedAt,
        tierHistories: {
          create: {
            prevTierId: member.tierId,
            currTierId: member.tierId,
            minTierId: member.minTierId,
            isActive: true,
            type: EnumTierHistoryMethod.INITIAL,
            expiryDate: expiryDate,
            createdAt: member.createdAt,
            updatedAt: member.updatedAt,
          },
        },
      },
    })
  }

  private async getMetadata(member: TMember): Promise<TMemberMetadata> {
    const messages: string[] = []

    if (member.expiryDate) {
      messages.push(
        this.message.setMessage('module.member.memberTierExpiresIn', {
          customLanguage: ScopeContext.getReqLang(),
          properties: {
            tierExpireDate: this.helperService.dateFormat(
              member.expiryDate,
              EnumDateFormat.HUMAN_DATE,
            ),
          },
        }),
      )
    }

    const nowDate = this.helperService.dateNow()
    const recentPoints = await this.memberUtil.getPointRecent(member.id, nowDate)
    if (recentPoints.length) {
      const recentExpiryDate = recentPoints[0].date
      const totalExpiredPoints = await this.prisma.memberPointHistory.aggregate({
        _sum: { point: true },
        where: {
          memberId: member.id,
          expiryDate: {
            gte: this.helperService.dateCreate(recentExpiryDate, { startOfDay: true }),
            lte: this.helperService.dateCreate(recentExpiryDate, { endOfDay: true }),
          },
        },
      })

      if (totalExpiredPoints._sum.point) {
        messages.push(
          this.message.setMessage('module.member.memberPointExpiresIn', {
            customLanguage: ScopeContext.getReqLang(),
            properties: {
              pointExpireValue: NumberUtil.decimal(totalExpiredPoints._sum.point, {
                useGrouping: true,
              }),
              pointExpireDate: this.helperService.dateFormat(
                recentExpiryDate,
                EnumDateFormat.HUMAN_DATE,
              ),
            },
          }),
        )
      }
    }

    return { messages }
  }

  async getProfile(id: number): Promise<TMember & TMemberMetadata> {
    const member = await this.findOrFail(id, {
      include: {
        tier: true,
      },
    })
    const metadata = await this.getMetadata(member)

    return { ...member, ...metadata }
  }

  async getOrderNumber(issuedAt: Date): Promise<string> {
    return await this.getSlipCounter(issuedAt, {
      type: EnumSlipType.ORDER,
    })
  }

  async getSlipCounter(issuedAt: Date, options: ISlipCounterOptions): Promise<string> {
    const key = this.helperService.dateFormat(issuedAt, EnumDateFormat.DATE_REFERENCE)
    const slip = await this.prisma.slipCounter.upsert({
      where: { type_key: { key, type: options.type } },
      create: { type: options.type, key, sequence: 1 },
      update: { sequence: { increment: 1 } },
    })

    const slipKey = Number(`${slip.sequence}${key}`).toString()

    if (options.prefix) {
      const sequence = this.helperService.baseEncode(slipKey, 36)
      return `${options.prefix}-${sequence}`
    }

    const code = this.helperService.baseEncode(slipKey, 36)
    const sequence = this.helperService.padZero(slip.sequence, { length: 4 })
    return `${code}${sequence}`
  }

  async getInvoiceNumber(issuedAt: Date): Promise<string> {
    return await this.getSlipCounter(issuedAt, {
      type: EnumSlipType.INVOICE,
    })
  }

  async resetBirthPurchased(memberIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()

    await this.prisma.member.updateMany({
      data: { hasBirthPurchased: false, hasBirthPurchasedAt: null },
      where: {
        hasBirthPurchased: true,
        id: { in: memberIds },
      },
    })

    return nowDate
  }

  async releaseMemberPoints(memberPointIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()

    const releasePoints = await this.prisma.memberPointHistory.findMany({
      where: { id: { in: memberPointIds } },
      orderBy: [{ releaseDate: 'asc' }],
    })

    for (const pointHistory of releasePoints) {
      const { id: _id, memberId, ...data } = pointHistory
      const aggregate = await this.prisma.memberPointHistory.aggregate({
        _sum: { point: true },
        where: { memberId, isActive: true, isDeleted: false },
      })

      await this.prisma.member.update({
        where: { id: memberId },
        data: {
          pointBalance: { increment: pointHistory.point },
          updatedAt: nowDate,
          pointHistories: {
            create: {
              ...data,
              isActive: true,
              isVisible: true,
              isPending: false,
              pointBalance: pointHistory.point + aggregate._sum.point,
              expiryDate: this.memberUtil.getPointExpirationDate(nowDate),
              createdAt: nowDate,
              updatedAt: nowDate,
            },
          },
        },
      })
    }
    return nowDate
  }

  async resetMemberPoints(issuedAt: Date, memberIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()

    for (const memberId of memberIds) {
      const member = await this.findOrFail(memberId)
      if (member.isActive) {
        const whereData: Prisma.MemberPointHistoryWhereInput = {
          isActive: true,
          isDeleted: false,
          expiryDate: { lte: issuedAt, not: null },
          memberId: member.id,
        }

        const aggregate = await this.prisma.memberPointHistory.aggregate({
          _sum: { point: true },
          where: whereData,
        })

        const pointBalance = aggregate._sum.point || 0

        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            pointBalance: { decrement: pointBalance },
            updatedAt: nowDate,
            pointHistories: {
              create: {
                type: EnumPointHistoryType.EXPIRY,
                tierId: member.tierId,
                point: pointBalance * -1,
                pointBalance: 0,
                expiryDate: nowDate,
                createdAt: nowDate,
                updatedAt: nowDate,
              },
              updateMany: {
                data: { isActive: false, isDeleted: true },
                where: whereData,
              },
            },
          },
        })
      }
    }
    return nowDate
  }

  async resetMemberTiers(tierHistoryIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    const rangeDate = this.helperService.dateRange(nowDate)

    const tierChart = this.tierService.getChart()

    const tierHistories = await this.prisma.memberTierHistory.findMany({
      where: {
        isActive: true,
        id: { in: tierHistoryIds },
      },
    })

    for (const tierHistory of tierHistories) {
      const { personalSpending, referralSpending } = tierHistory

      const maximumSpending = Math.max(personalSpending, referralSpending, 0)
      const extendDate = this.memberUtil.getTierExpirationDate(tierHistory.expiryDate)

      const { tierData } = tierChart.getData(
        tierHistory.currTierId,
        tierHistory.minTierId,
        maximumSpending,
      )

      const isRenewal = tierData.isRenewal()

      const newTierData: Prisma.MemberTierHistoryUncheckedCreateWithoutMemberInput = {
        minTierId: tierHistory.minTierId,
        prevTierId: tierHistory.currTierId,
        currTierId: tierData.curr.id,
        personalSpending: 0,
        referralSpending: 0,
        renewalSpending: tierData.curr.limitSpending,
        upgradeSpending: tierData.next.limitSpending,
        type: isRenewal ? EnumTierHistoryMethod.RENEWAL : EnumTierHistoryMethod.DOWNGRADE,
        expiryDate: isRenewal ? rangeDate.endOfYear : extendDate,
        isActive: true,
        createdAt: nowDate,
        updatedAt: nowDate,
      }

      await this.prisma.member.update({
        where: { id: tierHistory.memberId },
        data: {
          tierId: newTierData.currTierId,
          minTierId: newTierData.minTierId,
          maximumSpending: newTierData.upgradeSpending,
          personalSpending: newTierData.personalSpending,
          referralSpending: newTierData.referralSpending,
          expiryDate: newTierData.expiryDate,
          updatedAt: newTierData.updatedAt,
          tierHistories: {
            update: {
              where: { id: tierHistory.id },
              data: { isActive: false, isDeleted: true, updatedAt: newTierData.updatedAt },
            },
            create: newTierData,
          },
        },
      })
    }
    return nowDate
  }

  private async getReferrerData(
    member: TMember,
    kwargs: Omit<Prisma.MemberFindUniqueOrThrowArgs, 'where'> = {},
  ): Promise<MemberData> {
    if (member.invitedCode) {
      const referrer = await this.findOne({
        ...kwargs,
        where: { referralCode: member.invitedCode },
      })
      if (referrer) {
        const referrerData = await this.getRecentData(referrer)
        return referrerData.setIsReferrer(true)
      }
    }
    return null
  }

  private async getRecentData(member: TMember): Promise<MemberData> {
    const tierRecent = await this.prisma.memberTierHistory.findFirst({
      where: { memberId: member.id, isActive: true },
      orderBy: [{ id: 'desc' }],
    })

    if (tierRecent) {
      return MemberData.make(member, tierRecent)
    }

    const tierChart = this.tierService.getChart()
    const tierData = tierChart.getStats(member.tierId)
    const newTierHistory = await this.prisma.memberTierHistory.create({
      data: {
        memberId: member.id,
        prevTierId: member.tierId,
        currTierId: member.tierId,
        minTierId: member.minTierId,
        personalSpending: member.personalSpending,
        referralSpending: member.referralSpending,
        renewalSpending: tierData.curr.limitSpending,
        upgradeSpending: tierData.next.limitSpending,
        expiryDate: member.expiryDate,
        isActive: true,
        createdAt: member.createdAt,
        updatedAt: member.createdAt,
      },
    })
    return MemberData.make(member, newTierHistory)
  }

  async earnHighestBirthInvoice(month: number, memberIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    const dateRange = this.helperService.dateRange(nowDate)
    const startOfDay = this.helperService.dateCreate(nowDate, { startOfDay: true })

    const members = await this.prisma.member.findMany({
      where: {
        isActive: true,
        hasBirthPurchased: false,
        birthMonth: month,
        id: { in: memberIds },
      },
    })

    for (const member of members) {
      const birthPoint = await this.prisma.memberPointHistory.findFirst({
        where: {
          memberId: member.id,
          isBirth: true,
          isFirst: false,
          createdAt: {
            gte: dateRange.startOfMonth,
            lte: dateRange.endOfMonth,
          },
        },
        orderBy: [{ invoiceAmount: 'desc' }],
      })

      if (birthPoint) {
        const tierChart = this.tierService.getChart()
        const memberTier = tierChart.getInfo(member.tierId)
        const newPoint = TierUtil.round(birthPoint.point * (memberTier.birthdayRatio - 1))

        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            hasBirthPurchased: true,
            hasBirthPurchasedAt: startOfDay,
            updatedAt: startOfDay,
            pointHistories: {
              createMany: {
                data: {
                  invoiceId: birthPoint.invoiceId,
                  invoiceAmount: birthPoint.invoiceAmount,
                  type: EnumPointHistoryType.REWARD,
                  isBirth: true,
                  tierId: memberTier.id,
                  multipleRatio: memberTier.birthdayRatio,
                  point: newPoint,
                  pointBalance: member.pointBalance + newPoint,
                  createdAt: startOfDay,
                  updatedAt: startOfDay,
                },
              },
            },
          },
        })
      }
    }
    return nowDate
  }

  async earnPointFromInvoices(issuedAt: Date | string): Promise<Date> {
    issuedAt = this.helperService.dateCreateFromGeneric(issuedAt)
    const sinceInvoice = await this.invoiceUtil.getFirstInvoice(issuedAt)
    if (!sinceInvoice) {
      return
    }

    const tierChart = this.tierService.getChart()

    let sinceDate = this.helperService.dateCreate(sinceInvoice.issuedAt, { startOfDay: true })
    const untilDate = this.helperService.dateCreate(issuedAt, { startOfDay: true })

    while (sinceDate <= untilDate) {
      const grpInvoices = await this.invoiceUtil.getEarnInvoices(sinceDate)

      for (const [key, dateInvoices] of Object.entries(grpInvoices)) {
        let usedInvoiceIds = []
        for (const invoice of dateInvoices) {
          if (usedInvoiceIds.includes(invoice.id)) {
            continue
          }

          const member = await this.findOrFail(invoice.memberId)
          const memberData = await this.getRecentData(member)

          const memberTier = tierChart.getInfo(member.tierId)
          const memberRatio = member.hasFirstPurchased
            ? TierUtil.ratio(memberTier.personalRate)
            : TierUtil.ratio(memberTier.initialRate)
          const memberInvoices = member.hasFirstPurchased
            ? [invoice]
            : dateInvoices.filter(inv => inv.memberId === memberData.id)

          // const invoiceData = this.getDataFromInvoices(memberInvoices)
          const invoiceData = this.invoiceUtil.getData(memberInvoices)
          const { tierData, tierValue, invoiceIds } = memberData.hasFirstPurchased
            ? tierChart.calculateData(memberData, invoiceData)
            : tierChart.calculateDataInFirstPurchase(memberData, invoiceData)

          const pointExpiryDate = this.memberUtil.getPointExpirationDate(sinceDate)
          const tierExpiryDate = this.memberUtil.getTierExpirationDate(sinceDate)
          const isBirthMonth = this.helperService.dateIsSet(invoice.issuedAt, {
            month: member.birthMonth,
          })

          if (tierData.isUpgrade()) {
            memberData
              .addTierHistory({
                id: memberData.orgTierHistory.id,
                personalSpending: tierValue.usageAmount,
              })
              .addTierHistory({
                type: EnumTierHistoryMethod.UPGRADE,
                prevTierId: tierData.info.id,
                currTierId: tierData.curr.id,
                invoiceId: invoiceIds[invoiceIds.length - 1],
                personalSpending: tierValue.currAmount,
                excessSpending: tierValue.excessAmount,
                renewalSpending: tierData.curr.limitSpending,
                upgradeSpending: tierData.next.limitSpending,
                expiryDate: tierExpiryDate,
                createdAt: sinceDate,
                updatedAt: sinceDate,
              })
              .addPointHistory({
                type: EnumPointHistoryType.REWARD,
                tierId: memberData.orgTierId,
                invoiceId: invoiceIds[invoiceIds.length - 1],
                invoiceAmount: tierValue.usageAmount,
                isFirst: !memberData.hasFirstPurchased,
                isBirth: memberData.hasBirthPurchased,
                multipleRatio: memberRatio,
                point: TierUtil.round(memberRatio * tierValue.usageAmount),
                expiryDate: pointExpiryDate,
                createdAt: sinceDate,
                updatedAt: sinceDate,
              })
              .addPointHistory({
                type: EnumPointHistoryType.REWARD,
                tierId: tierData.curr.id,
                invoiceId: invoiceIds[invoiceIds.length - 1],
                invoiceAmount: tierValue.currAmount,
                multipleRatio: memberRatio,
                isFirst: !memberData.hasFirstPurchased,
                isBirth: memberData.hasBirthPurchased,
                point: TierUtil.round(memberRatio * tierValue.currAmount),
                expiryDate: pointExpiryDate,
                createdAt: sinceDate,
                updatedAt: sinceDate,
              })
          } else {
            memberData
              .addTierHistory({
                id: memberData.orgTierHistory.id,
                personalSpending: tierValue.usageAmount,
              })
              .addPointHistory({
                type: EnumPointHistoryType.REWARD,
                tierId: tierData.curr.id,
                invoiceId: invoiceIds[invoiceIds.length - 1],
                invoiceAmount: tierValue.usageAmount,
                isFirst: !memberData.hasFirstPurchased,
                isBirth: memberData.hasBirthPurchased,
                multipleRatio: memberRatio,
                point: TierUtil.round(memberRatio * tierValue.usageAmount),
                expiryDate: pointExpiryDate,
                createdAt: sinceDate,
                updatedAt: sinceDate,
              })
          }

          if (!member.hasFirstPurchased) {
            const referrerData = await this.getReferrerData(member)
            if (referrerData && referrerData.isActive) {
              const { tierData, tierValue } = tierChart.calculateData(referrerData, invoiceData)

              if (tierData.isUpgrade()) {
                referrerData.addTierHistory({
                  type: EnumTierHistoryMethod.UPGRADE,
                  prevTierId: tierData.info.id,
                  currTierId: tierData.curr.id,
                  invoiceId: invoiceIds[invoiceIds.length - 1],
                  personalSpending: tierValue.currAmount,
                  referralSpending: 0,
                  excessSpending: tierValue.excessAmount,
                  renewalSpending: tierData.curr.limitSpending,
                  upgradeSpending: tierData.next.limitSpending,
                  expiryDate: tierExpiryDate,
                  createdAt: sinceDate,
                  updatedAt: sinceDate,
                })
              } else {
                referrerData.addTierHistory({
                  id: referrerData.orgTierHistory.id,
                  referralSpending: tierValue.totalAmount,
                })

                if (tierData.curr.referralRate && referrerData.hasDiamondAchieved) {
                  referrerData.addPointHistory({
                    type: EnumPointHistoryType.REFER,
                    refereeId: memberData.id,
                    tierId: referrerData.tierId,
                    invoiceId: invoiceIds[invoiceIds.length - 1],
                    invoiceAmount: tierValue.usageAmount,
                    multipleRatio: TierUtil.ratio(tierData.curr.referralRate),
                    point: TierUtil.convert(tierValue.usageAmount, tierData.curr.referralRate),
                    expiryDate: pointExpiryDate,
                    createdAt: sinceDate,
                    updatedAt: sinceDate,
                  })
                }
              }

              referrerData.addRefereeData(memberData).setDiamondAchieved(tierData.isUpgrade())
            }
          }

          usedInvoiceIds = [...usedInvoiceIds, ...invoiceIds]

          // Update member flags
          memberData
            .setFirstPurchased()
            .setBirthPurchased(isBirthMonth)
            .setDiamondAchieved(tierData.isUpgrade())

          await this.prisma.$transaction(async tx => {
            await tx.member.update({
              where: { id: member.id },
              data: {
                tierId: memberData.tierId,
                minTierId: memberData.minTierId,
                expiryDate: memberData.expiryDate,
                pointBalance: memberData.pointBalance,
                maximumSpending: memberData.maximumSpending,
                personalSpending: memberData.personalSpending,
                referralSpending: memberData.referralSpending,
                hasFirstPurchased: memberData.hasFirstPurchased,
                hasFirstPurchasedAt: memberData.hasFirstPurchasedAt,
                hasBirthPurchased: memberData.hasBirthPurchased,
                hasBirthPurchasedAt: memberData.hasBirthPurchasedAt,
                hasDiamondAchieved: memberData.hasDiamondAchieved,
                hasDiamondAchievedAt: memberData.hasDiamondAchievedAt,
                updatedAt: memberData.updatedAt,
                invoices: {
                  updateMany: {
                    where: { id: { in: invoiceData.ids } },
                    data: { isEarned: true, updatedAt: memberData.updatedAt },
                  },
                },
                tierHistories: {
                  update: {
                    where: { id: memberData.orgTierHistory.id },
                    data: memberData.orgTierHistory.data,
                  },
                  createMany: {
                    data: memberData.tierHistories,
                    skipDuplicates: true,
                  },
                },
                pointHistories: {
                  createMany: {
                    data: memberData.pointHistories,
                    skipDuplicates: true,
                  },
                },
              },
            })

            if (memberData.hasReferrer()) {
              const refererData = memberData.getReferrerData()
              await tx.member.update({
                where: { id: refererData.id },
                data: {
                  tierId: refererData.tierId,
                  minTierId: refererData.minTierId,
                  expiryDate: refererData.expiryDate,
                  pointBalance: refererData.pointBalance,
                  maximumSpending: refererData.maximumSpending,
                  personalSpending: refererData.personalSpending,
                  referralSpending: refererData.referralSpending,
                  hasDiamondAchieved: refererData.hasDiamondAchieved,
                  hasDiamondAchievedAt: refererData.hasDiamondAchievedAt,
                  updatedAt: refererData.updatedAt,
                  tierHistories: {
                    update: {
                      where: { id: refererData.orgTierHistory.id },
                      data: refererData.orgTierHistory.data,
                    },
                    createMany: {
                      data: refererData.tierHistories,
                      skipDuplicates: true,
                    },
                  },
                  pointHistories: {
                    createMany: {
                      data: refererData.pointHistories,
                      skipDuplicates: true,
                    },
                  },
                },
              })
            }
          })
        }

        //  garbage collection (GC) to clean up unused memory
        grpInvoices[key] = null
      }

      sinceDate = this.helperService.dateForward(sinceDate, { day: 1 })
    }
    return issuedAt
  }
}

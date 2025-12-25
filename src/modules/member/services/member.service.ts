import {
  ConflictException,
  HttpStatus,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ModuleRef } from '@nestjs/core'
import {
  ENUM_MEMBER_TIER_ACTION,
  ENUM_MEMBER_TYPE,
  ENUM_POINT_TYPE,
  ENUM_SLIP_TYPE,
  Member,
  Prisma,
} from '@prisma/client'
import { ENUM_AUTH_SCOPE_TYPE, IAuthPassword } from 'lib/nest-auth'
import {
  APP_LANGUAGE,
  AppContext,
  CryptoService,
  ENUM_DATE_FORMAT,
  HelperService,
  MessageService,
  NumberUtil,
} from 'lib/nest-core'
import { IPrismaOptions, IPrismaParams, PrismaService } from 'lib/nest-prisma'
import { IResponseList, IResponsePaging } from 'lib/nest-web'
import { InvoiceService } from 'modules/invoice/services'
import { InvoiceUtil } from 'modules/invoice/utils'
import { TierService } from 'modules/tier/services'
import { TierUtil } from 'modules/tier/utils'
import { MemberChangePasswordRequestDto } from '../dtos'
import { MemberData } from '../helpers'
import { ISlipCounterOptions, TMember, TMemberMetadata } from '../interfaces'
import { MemberAuthService } from '../services'

@Injectable()
export class MemberService implements OnModuleInit {
  private tierService: TierService
  private invoiceService: InvoiceService

  constructor(
    private readonly ref: ModuleRef,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly messageService: MessageService,
    private readonly helperService: HelperService,
  ) {}

  async onModuleInit() {
    this.tierService = this.ref.get(TierService, { strict: false })
    this.invoiceService = this.ref.get(InvoiceService, { strict: false })
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
  ): Promise<IResponseList> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.member.list(where, params, options)
    })
  }

  async paginate(
    where?: Prisma.MemberWhereInput,
    params?: IPrismaParams,
    options?: IPrismaOptions,
  ): Promise<IResponsePaging> {
    return await this.prisma.$extension(async (ex) => {
      return await ex.member.paginate(where, params, options)
    })
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
    { passwordHash }: IAuthPassword,
  ): Promise<TMember> {
    await this.differOrFail({
      OR: [{ phone: data?.phone }, { email: data?.email }],
    })

    if (data?.birthDate) {
      const dateOfBirth = this.helperService.dateCreate(new Date(`${data.birthDate}`))
      const extractDate = this.helperService.dateExtract(dateOfBirth)
      data.birthDay = extractDate.day
      data.birthMonth = extractDate.month
      data.birthYear = extractDate.year
    }

    const dateNow = this.helperService.dateCreate()
    const dateRange = this.helperService.dateRange(dateNow)
    const { country, phone } = this.helperService.parsePhone(data.phone)

    const normalTier = this.tierService.getChart().getNormalTier()

    return await this.prisma.member.create({
      data: {
        ...data,
        tierId: normalTier.id,
        minTierId: normalTier.id,
        type: ENUM_MEMBER_TYPE.NORMAL,
        expiryDate: dateRange.endOfYear,
        locale: APP_LANGUAGE,
        phoneCountry: country,
        phoneNumber: phone,
        startedAt: data?.startedAt ?? dateNow,
        isEmailVerified: false,
        isPhoneVerified: false,
        password: passwordHash,
        createdAt: dateNow,
        updatedAt: dateNow,
        tierHistories: {
          createMany: {
            data: [
              {
                prevTierId: normalTier.id,
                currTierId: normalTier.id,
                isActive: true,
                type: ENUM_MEMBER_TIER_ACTION.INITIAL,
                expiryDate: dateRange.endOfYear,
                createdAt: dateNow,
                updatedAt: dateNow,
              },
            ],
            skipDuplicates: true,
          },
        },
      },
    })
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
    const authService = this.ref.get<MemberAuthService>(ENUM_AUTH_SCOPE_TYPE.MEMBER, {
      strict: false,
    })
    return await authService.changePassword(member, dto)
  }

  async addPoint(id: number, data: { point: number; createdBy: number }): Promise<Member> {
    const member = await this.findOrFail(id)

    const dateNow = this.helperService.dateCreate()

    return await this.prisma.member.update({
      where: { id },
      data: {
        pointBalance: { increment: data.point },
        updatedAt: dateNow,
        pointHistories: {
          create: {
            point: data.point,
            createdBy: data.createdBy,
            tierId: member.tierId,
            type: ENUM_POINT_TYPE.SYSTEM,
            createdAt: dateNow,
            updatedAt: dateNow,
          },
        },
      },
    })
  }

  async closeProfile(id: number, reasons?: string[]) {
    const member = await this.find(id)
    if (member && member?.isActive) {
      // clear all personal information and associated data
      const dateNow = this.helperService.dateCreate()
      const timestamp = this.helperService.dateGetTimestamp(dateNow)
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
                  createdAt: dateNow,
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

  async onCreated(member: TMember): Promise<TMember> {
    const memberCode = this.getMembershipCode(member)
    const expiryDate = this.getTierExpirationDate(member.createdAt)

    return await this.prisma.member.update({
      where: { id: member.id },
      data: {
        code: memberCode,
        expiryDate: expiryDate,
        updatedAt: member.updatedAt,
        tierHistories: {
          create: {
            prevTierId: member.tierId,
            currTierId: member.tierId,
            minTierId: member.minTierId,
            isActive: true,
            type: ENUM_MEMBER_TIER_ACTION.INITIAL,
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
        this.messageService.setMessage('module.member.memberTierExpiresIn', {
          customLanguage: AppContext.language(),
          properties: {
            tierExpireDate: this.helperService.dateFormat(
              member.expiryDate,
              ENUM_DATE_FORMAT.HUMAN_DATE,
            ),
          },
        }),
      )
    }

    const dateNow = this.helperService.dateCreate()
    const recentPoints = await this.getPointRecent(member.id, dateNow)
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
          this.messageService.setMessage('module.member.memberPointExpiresIn', {
            customLanguage: AppContext.language(),
            properties: {
              pointExpireValue: NumberUtil.numeric(totalExpiredPoints._sum.point, {
                useGrouping: true,
              }),
              pointExpireDate: this.helperService.dateFormat(
                recentExpiryDate,
                ENUM_DATE_FORMAT.HUMAN_DATE,
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

  async getPointRecents(
    id: number,
    pointRequire: number,
  ): Promise<{ date: Date; point: number }[]> {
    const results = []
    const dateNow = this.helperService.dateCreate()

    let len = 0
    while (pointRequire > 0) {
      len += 2
      const recents = await this.getPointRecent(id, dateNow, len)
      if (len > 2 && recents.length < len) {
        break
      }

      const lastRecents = recents.length <= 2 ? recents : recents.slice(-2)
      if (lastRecents.length === 0) {
        break
      }

      for (const recentPoint of lastRecents) {
        const pointReduce = Math.min(pointRequire, recentPoint.point)
        if (pointReduce > 0) {
          results.push({
            date: recentPoint.date,
            point: pointReduce,
          })
        }

        pointRequire -= pointReduce
      }
      // const recentPoint = await this.prisma.memberPointHistory.findFirst({
      //   where: { memberId: id, isActive: true, isPending: false, point: { gt: 0 } },
      //   orderBy: { expiryDate: 'asc' },
      //   select: { expiryDate: true, point: true },
      // })

      // const pointReduce = Math.min(pointRequire, recentPoint.point)
      // results.push({
      //   date: recentPoint.expiryDate,
      //   point: pointReduce,
      // })

      // if (pointReduce <= 0) break
      // pointRequire -= pointReduce
    }
    return results
  }

  async getPointRecent(
    id: number,
    issuedAt: Date,
    take: number = 1,
  ): Promise<{ date: Date; point: number }[]> {
    const pointGroups = await this.prisma.memberPointHistory.groupBy({
      by: ['memberId', 'expiryDate'],
      _sum: { point: true },
      having: { point: { _sum: { gt: 0 } } },
      where: {
        memberId: id,
        isActive: true,
        isDeleted: false,
        isPending: false,
        expiryDate: { gte: issuedAt },
        createdAt: { lte: issuedAt },
      },
      take,
      orderBy: [{ expiryDate: 'asc' }],
    })
    return pointGroups.map((pointGroup) => ({
      date: pointGroup.expiryDate,
      point: pointGroup._sum.point,
    }))
  }

  async getPointBalance(id: number, issuedAt: Date): Promise<number> {
    const pointBalance = await this.prisma.memberPointHistory.aggregate({
      _sum: { point: true },
      where: {
        memberId: id,
        isActive: true,
        isDeleted: false,
        isPending: false,
        expiryDate: { gte: issuedAt },
        createdAt: { lte: issuedAt },
      },
    })
    return pointBalance._sum.point || 0
  }

  getPointExpirationDate(issuedAt: Date, ttl?: number): Date {
    const expiresInYear = this.config.getOrThrow<number>('app.membership.expiresIn')
    if (expiresInYear > 0 || ttl > 0) {
      const endOfDay = this.helperService.dateCreate(issuedAt, { endOfDay: true })
      return this.helperService.dateForward(endOfDay, { year: ttl || expiresInYear })
    }
    return undefined
  }

  getTierExpirationDate(issuedAt: Date, ttl?: number): Date {
    const expiresInYear = this.config.getOrThrow<number>('app.membership.expiresIn')
    if (expiresInYear > 0 || ttl > 0) {
      const endOfDay = this.helperService.dateCreate(issuedAt, { endOfDay: true })
      return this.helperService.dateForward(endOfDay, { year: ttl || expiresInYear })
    }
    return undefined
  }

  getMembershipCode(member: TMember): string {
    const digits = this.config.getOrThrow<number>('app.membership.codeDigits')
    return this.helperService.padZero(member.id, digits, 'T')
  }

  async getOrderNumber(issuedAt: Date): Promise<string> {
    // const key = this.helperService.dateFormat(issuedAt, ENUM_DATE_FORMAT.DATE_REFERENCE)
    // const slip = await this.prisma.slipCounter.upsert({
    //   where: { type_key: { key, type: ENUM_SLIP_TYPE.ORDER } },
    //   create: { type: ENUM_SLIP_TYPE.ORDER, key, sequence: 1 },
    //   update: { sequence: { increment: 1 } },
    // })

    // const sequence = this.helperService.padZero(slip.sequence, 4)
    // return this.cryptoService.base62Encrypt(Number(`${key}${sequence}`), {
    //   number: true,
    //   lowercase: true,
    //   uppercase: true,
    // })
    // return `ORD-${key}${sequence}`
    return await this.getSlipCounter(issuedAt, {
      type: ENUM_SLIP_TYPE.ORDER,
    })
  }

  async getSlipCounter(issuedAt: Date, options: ISlipCounterOptions): Promise<string> {
    const key = this.helperService.dateFormat(issuedAt, ENUM_DATE_FORMAT.DATE_REFERENCE)
    const slip = await this.prisma.slipCounter.upsert({
      where: { type_key: { key, type: options.type } },
      create: { type: options.type, key, sequence: 1 },
      update: { sequence: { increment: 1 } },
    })

    const numb = Number(`${slip.sequence}${key}`)

    if (options.prefix) {
      const sequence = this.cryptoService.base62Encrypt(numb, { uppercase: true })
      return `${options.prefix}-${sequence}`
    }

    const code = this.cryptoService.base62Encrypt(numb, { uppercase: true })
    const sequence = this.helperService.padZero(slip.sequence, 4)
    return `${code}${sequence}`
  }

  async getInvoiceNumber(issuedAt: Date): Promise<string> {
    // const key = this.helperService.dateFormat(issuedAt, ENUM_DATE_FORMAT.DATE_REFERENCE)
    // const slip = await this.prisma.slipCounter.upsert({
    //   where: { type_key: { key, type: ENUM_SLIP_TYPE.INVOICE } },
    //   create: { type: ENUM_SLIP_TYPE.INVOICE, key, sequence: 1 },
    //   update: { sequence: { increment: 1 } },
    // })
    // const sequence = this.helperService.padZero(slip.sequence, 4)
    // return `INV-${key}${sequence}`

    return await this.getSlipCounter(issuedAt, {
      type: ENUM_SLIP_TYPE.INVOICE,
    })
  }

  async resetBirthPurchased(issuedAt: Date): Promise<boolean> {
    const dateRange = this.helperService.dateRange(issuedAt)

    await this.prisma.member.updateMany({
      data: { hasBirthPurchased: false, hasBirthPurchasedAt: null },
      where: {
        hasBirthPurchased: true,
        hasBirthPurchasedAt: { gte: dateRange.startOfYear, not: null },
        updatedAt: dateRange.startOfDay,
      },
    })

    return true
  }

  async releaseMemberPoint(issuedAt: Date) {
    const batchSize: number = 500
    const startOfDay = this.helperService.dateCreate(issuedAt, { startOfDay: true })

    let loop: boolean = false
    do {
      const releasePoints = await this.prisma.memberPointHistory.findMany({
        where: {
          isPending: true,
          isDeleted: false,
          releaseDate: { lte: startOfDay, not: null },
          member: { isActive: true },
        },
        take: batchSize,
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
            updatedAt: startOfDay,
            pointHistories: {
              create: {
                ...data,
                isActive: true,
                isVisible: true,
                isPending: false,
                pointBalance: pointHistory.point + aggregate._sum.point,
                expiryDate: this.getPointExpirationDate(startOfDay),
                createdAt: startOfDay,
                updatedAt: startOfDay,
              },
            },
          },
        })
      }

      loop = releasePoints.length === batchSize
    } while (loop)
    return true
  }

  async resetMemberPoint(issuedAt: Date) {
    const batchSize: number = 500
    const startOfDay = this.helperService.dateCreate(issuedAt, { startOfDay: true })
    const where: Prisma.MemberPointHistoryWhereInput = {
      isActive: true,
      isDeleted: false,
      expiryDate: { lte: startOfDay, not: null },
    }

    let loop: boolean = false
    do {
      const distinctMembers = await this.prisma.memberPointHistory.findMany({
        where,
        take: batchSize,
        select: { memberId: true },
        distinct: ['memberId'],
      })

      for (const point of distinctMembers) {
        const member = await this.findOrFail(point.memberId)
        if (member.isActive) {
          const aggregate = await this.prisma.memberPointHistory.aggregate({
            _sum: { point: true },
            where: { ...where, memberId: member.id },
          })

          await this.prisma.member.update({
            where: { id: member.id },
            data: {
              pointBalance: { decrement: aggregate._sum.point },
              updatedAt: startOfDay,
              pointHistories: {
                create: {
                  type: ENUM_POINT_TYPE.EXPIRY,
                  tierId: member.tierId,
                  point: aggregate._sum.point * -1,
                  pointBalance: 0,
                  expiryDate: startOfDay,
                  createdAt: startOfDay,
                  updatedAt: startOfDay,
                },
                updateMany: {
                  data: { isActive: false, isDeleted: true },
                  where,
                },
              },
            },
          })
        }
      }

      loop = distinctMembers.length === batchSize
    } while (loop)
    return true
  }

  async resetMemberTier(issuedAt: Date) {
    const dateRange = this.helperService.dateRange(issuedAt)
    const batchSize: number = 500

    const tierChart = this.tierService.getChart()

    let loop: boolean = false
    do {
      const tierHistories = await this.prisma.memberTierHistory.findMany({
        take: batchSize,
        where: {
          isActive: true,
          expiryDate: { lte: dateRange.startOfDay },
        },
      })

      for (const tierHistory of tierHistories) {
        const { personalSpending, referralSpending } = tierHistory

        const maximumSpending = Math.max(personalSpending, referralSpending, 0)
        const extendDate = this.getTierExpirationDate(tierHistory.expiryDate)

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
          type: isRenewal ? ENUM_MEMBER_TIER_ACTION.RENEWAL : ENUM_MEMBER_TIER_ACTION.DOWNGRADE,
          expiryDate: isRenewal ? dateRange.endOfYear : extendDate,
          isActive: true,
          createdAt: dateRange.startOfDay,
          updatedAt: dateRange.startOfDay,
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

      loop = tierHistories.length === batchSize
    } while (loop)

    return true
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

  async earnHighestBirthInvoice(issuedAt: Date) {
    const dateExtract = this.helperService.dateExtract(issuedAt)
    const dateRange = this.helperService.dateRange(issuedAt)
    const startOfDay = this.helperService.dateCreate(issuedAt, { startOfDay: true })

    const members = await this.prisma.member.findMany({
      where: {
        isActive: true,
        hasBirthPurchased: false,
        birthMonth: dateExtract.month,
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
                  type: ENUM_POINT_TYPE.REWARD,
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
  }

  async earnPointFromInvoices(issuedAt: Date) {
    const sinceInvoice = await this.invoiceService.getFirstInvoice(issuedAt)
    if (!sinceInvoice) return

    const tierChart = this.tierService.getChart()

    let sinceDate = this.helperService.dateCreate(sinceInvoice.issuedAt, { startOfDay: true })
    const untilDate = this.helperService.dateCreate(issuedAt, { startOfDay: true })

    while (sinceDate <= untilDate) {
      const grpInvoices = await this.invoiceService.getEarnInvoices(sinceDate)

      for (const [key, dateInvoices] of Object.entries(grpInvoices)) {
        let usedInvoiceIds = []
        for (const invoice of dateInvoices) {
          if (usedInvoiceIds.includes(invoice.id)) continue

          const member = await this.findOrFail(invoice.memberId)
          const memberData = await this.getRecentData(member)

          const memberTier = tierChart.getInfo(member.tierId)
          const memberRatio = member.hasFirstPurchased
            ? TierUtil.ratio(memberTier.personalRate)
            : TierUtil.ratio(memberTier.initialRate)
          const memberInvoices = member.hasFirstPurchased
            ? [invoice]
            : dateInvoices.filter((inv) => inv.memberId === memberData.id)

          // const invoiceData = this.getDataFromInvoices(memberInvoices)
          const invoiceData = InvoiceUtil.getData(memberInvoices)
          const { tierData, tierValue, invoiceIds } = memberData.hasFirstPurchased
            ? tierChart.calculateData(memberData, invoiceData)
            : tierChart.calculateDataInFirstPurchase(memberData, invoiceData)

          const pointExpiryDate = this.getPointExpirationDate(sinceDate)
          const tierExpiryDate = this.getTierExpirationDate(sinceDate)
          const isBirthMonth = this.helperService.dateCheckSet(invoice.issuedAt, {
            month: member.birthMonth,
          })

          if (tierData.isUpgrade()) {
            memberData
              .addTierHistory({
                id: memberData.orgTierHistory.id,
                personalSpending: tierValue.usageAmount,
              })
              .addTierHistory({
                type: ENUM_MEMBER_TIER_ACTION.UPGRADE,
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
                type: ENUM_POINT_TYPE.REWARD,
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
                type: ENUM_POINT_TYPE.REWARD,
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
                type: ENUM_POINT_TYPE.REWARD,
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
                  type: ENUM_MEMBER_TIER_ACTION.UPGRADE,
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
                    type: ENUM_POINT_TYPE.REFER,
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

          await this.prisma.$transaction(async (tx) => {
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
  }
}

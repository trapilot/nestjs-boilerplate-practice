import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import {
  EnumMemberType,
  EnumPointAction,
  EnumPointOrigin,
  EnumPointReason,
  EnumSlipType,
  EnumTransitionRule,
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
  IPrismaExportOptions,
  IPrismaReturnList,
  IPrismaReturnPaging,
  PrismaService,
} from 'lib/nest-prisma'
import { MemberPointService } from 'modules/member-point/services/member-point.service'
import { MemberTierService } from 'modules/member-tier/services/member-tier.service'
import { TierService } from 'modules/tier/services/tier.service'
import { MemberCreatedEvent } from '../events/member.created.event'
import { MemberDowngradeEvent } from '../events/member.downgrade.event'
import { MemberRenewalEvent } from '../events/member.renewal.event'
import { MemberUtil } from '../helpers/member.util'
import { ISlipCounterOptions, TMember, TMemberMetadata } from '../interfaces/member.interface'

@Injectable()
export class MemberService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly message: MessageService,
    private readonly helperService: HelperService,
    private readonly tierService: TierService,
    private readonly memberPointService: MemberPointService,
    private readonly memberTierService: MemberTierService,
    private readonly memberUtil: MemberUtil,
  ) {}

  async getOne(kwargs: Prisma.MemberFindUniqueArgs): Promise<TMember> {
    return await this.prisma.member.findUnique(kwargs)
  }

  async getFirst(kwargs?: Prisma.MemberFindFirstArgs): Promise<TMember> {
    return await this.prisma.member.findFirst(kwargs)
  }

  async getMany(kwargs?: Prisma.MemberFindManyArgs): Promise<TMember[]> {
    return await this.prisma.member.findMany(kwargs)
  }

  async getList(
    kwargs: Prisma.MemberFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnList> {
    return await this.prisma.member.list(kwargs, options)
  }

  async getPage(
    kwargs: Prisma.MemberFindManyArgs,
    options?: IPrismaExportOptions,
  ): Promise<IPrismaReturnPaging> {
    return await this.prisma.member.paginate(kwargs, options)
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

  async create(
    data: Prisma.MemberUncheckedCreateInput,
    authPassword: IAuthPassword,
  ): Promise<TMember> {
    if (data?.birthDate) {
      const dateOfBirth = this.helperService.dateCreateFromGeneric(data.birthDate)
      const extractDate = this.helperService.dateExtract(dateOfBirth)
      data.birthDay = extractDate.day
      data.birthMonth = extractDate.month
      data.birthYear = extractDate.year
    }

    const nowDate = this.helperService.dateNow()
    const { endOfYear } = this.helperService.dateRange(nowDate)
    const { region, phone } = this.helperService.parsePhone(data.phone)
    const { id: tierId } = await this.tierService.getNormalTier()

    const member = await this.prisma.member.create({
      data: {
        tierId: tierId,
        minTierId: tierId,
        type: EnumMemberType.NORMAL,
        expiryDate: endOfYear,
        locale: APP_LANGUAGE,
        phoneRegion: region,
        phoneNumber: phone,
        startedAt: nowDate,
        isEmailVerified: false,
        isPhoneVerified: false,
        password: authPassword.passwordHash,
        createdAt: nowDate,
        updatedAt: nowDate,
        ...data,
      },
    })

    await this.memberUtil.publishEvent(new MemberCreatedEvent(member))

    return member
  }

  async update(id: number, data: Prisma.MemberUncheckedUpdateInput): Promise<TMember> {
    const member = await this.findOrFail(id)

    const { region, phone } = this.helperService.parsePhone(`${data?.phone}`)

    return await this.prisma.member.update({
      data: {
        ...data,
        phoneRegion: region,
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

  async changeAvatar(member: TMember, data: Prisma.MemberUncheckedUpdateInput): Promise<TMember> {
    return await this.prisma.member.update({
      data,
      where: { id: member.id },
    })
  }

  async addPoint(id: number, data: { point: number; createdBy: number }): Promise<Member> {
    const member = await this.findOrFail(id)

    const nowDate = this.helperService.dateNow()

    return await this.prisma.member.update({
      where: { id },
      data: {
        pointBalance: { increment: data.point },
        updatedAt: nowDate,
        points: {
          create: {
            point: data.point,
            createdBy: data.createdBy,
            tierId: member.tierId,
            origin: EnumPointOrigin.ADMIN,
            reason: EnumPointReason.ADJUST,
            action: EnumPointAction.PLUS,
            createdAt: nowDate,
            updatedAt: nowDate,
          },
        },
      },
    })
  }

  async closeProfile(id: number, reasons?: string[]): Promise<boolean> {
    const member = await this.getOne({ where: { id } })
    if (member && member?.isActive) {
      // clear all personal information and associated data
      const nowDate = this.helperService.dateNow()
      const timestamp = this.helperService.dateGetTimestamp(nowDate)
      await this.prisma.member.update({
        data: {
          isActive: false,
          email: this.helperService.dirtyString(member.email, timestamp),
          phone: this.helperService.dirtyString(member.phone, timestamp),
          deletions: {
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
    const recentPoints = await this.getPointRecents(member.id, { untilDate: nowDate })
    if (recentPoints.length) {
      const recentExpiryDate = recentPoints[0].date
      const totalExpiredPoints = await this.prisma.memberPoint.aggregate({
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

  async checkPointBalance(
    memberId: number,
    options: { pointRequire: number; issuedAt: Date },
  ): Promise<number> {
    const pointBalance = await this.getPointBalance(memberId, options.issuedAt)
    if (options.pointRequire > pointBalance) {
      throw new BadRequestException({
        statusCode: HttpStatus.CONFLICT,
        message: 'module.member.notEnoughPoint',
        messageProperties: {
          memberId,
          pointBalance,
          pointRequire: options.pointRequire,
        },
      })
    }

    return pointBalance
  }

  async getPointBalance(memberId: number, issuedAt: Date): Promise<number> {
    return await this.memberPointService.sumMemberActivePoints(memberId, issuedAt)
  }

  async getPointRecents(
    memberId: number,
    options: { pointRequire?: number; untilDate: Date },
  ): Promise<{ date: Date; point: number }[]> {
    return await this.memberPointService.getMemberRecentPoints(memberId, options)
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

  async releaseMemberPoints(_memberPointIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    return nowDate
    // const releasePoints = await this.prisma.memberPoint.findMany({
    //   where: { id: { in: memberPointIds } },
    //   orderBy: [{ releaseDate: 'asc' }],
    // })

    // for (const pointHistory of releasePoints) {
    //   const { id: _id, memberId, ...data } = pointHistory
    //   const aggregate = await this.prisma.memberPoint.aggregate({
    //     _sum: { point: true },
    //     where: { memberId, isActive: true, isDeleted: false },
    //   })

    //   await this.prisma.member.update({
    //     where: { id: memberId },
    //     data: {
    //       pointBalance: { increment: pointHistory.point },
    //       updatedAt: nowDate,
    //       points: {
    //         createMany: {
    //           data: [
    //             {
    //               ...data,
    //               isActive: true,
    //               isVisible: true,
    //               isPending: false,
    //               pointBalance: pointHistory.point + aggregate._sum.point,
    //               expiryDate: this.memberUtil.getPointExpirationDate(nowDate),
    //               createdAt: nowDate,
    //               updatedAt: nowDate,
    //             },
    //           ],
    //           skipDuplicates: true,
    //         },
    //       },
    //     },
    //   })
    // }
    // return nowDate
  }

  async resetMemberPoints(issuedAt: Date, memberIds: number[]): Promise<Date> {
    const nowDate = this.helperService.dateNow()

    for (const memberId of memberIds) {
      const member = await this.findOrFail(memberId)
      if (member.isActive) {
        const whereData: Prisma.MemberPointWhereInput = {
          isActive: true,
          isDeleted: false,
          expiryDate: { lte: issuedAt, not: null },
          memberId: member.id,
        }

        const aggregate = await this.prisma.memberPoint.aggregate({
          _sum: { point: true },
          where: whereData,
        })

        const pointBalance = aggregate._sum.point || 0

        await this.prisma.member.update({
          where: { id: member.id },
          data: {
            pointBalance: 0,
            updatedAt: nowDate,
            points: {
              create: {
                origin: EnumPointOrigin.SYSTEM,
                reason: EnumPointReason.EXPIRE,
                action: EnumPointAction.DEDUCT,
                tierId: member.tierId,
                point: pointBalance * -1,
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

  async processExpiredMember(memberId: number): Promise<void> {
    const member = await this.findOrFail(memberId)

    if (await this.isExpired(member)) {
      if (await this.canRenew(member)) {
        await this.renewal(member)
      } else {
        await this.downgrade(member)
      }
    }
  }

  private async isExpired(member: TMember): Promise<boolean> {
    const nowDate = this.helperService.dateNow()

    return this.helperService.dateIsBefore(member.expiryDate, {
      baseDate: nowDate,
    })
  }

  private async canRenew(member: TMember): Promise<boolean> {
    const tierTransitions = await this.tierService.getTransitions(member.tierId)

    for (const tierTransition of tierTransitions) {
      if (!tierTransition.isEnabled) continue
      if (tierTransition.rule !== EnumTransitionRule.AMOUNT) continue

      if (tierTransition.prevTierId === tierTransition.nextTierId) {
        const finalAmount = Math.max(member.personalAmount, member.referralAmount)

        return tierTransition.value <= finalAmount
      }
    }
    return false
  }

  private async renewal(member: TMember): Promise<void> {
    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        personalAmount: 0,
        referralAmount: 0,
        expiryDate: this.memberUtil.getTierExpirationDate(member.expiryDate),
        tiers: {
          updateMany: {
            where: { memberId: member.id, isActive: true },
            data: { isActive: false },
          },
        },
      },
    })

    await this.memberUtil.publishEvent(new MemberRenewalEvent(updated))
  }

  private async downgrade(member: TMember): Promise<void> {
    const tierTransitions = await this.tierService.getTransitions(member.tierId, true)

    const finalAmount = Math.max(member.personalAmount, member.referralAmount)

    const nextTransition = tierTransitions.find(
      transition =>
        transition.isEnabled &&
        transition.rule === EnumTransitionRule.AMOUNT &&
        transition.value < finalAmount,
    )

    const updated = await this.prisma.member.update({
      where: { id: member.id },
      data: {
        personalAmount: 0,
        referralAmount: 0,
        tierId: nextTransition.nextTierId,
        expiryDate: this.memberUtil.getTierExpirationDate(member.expiryDate),
        tiers: {
          updateMany: {
            where: { memberId: member.id, isActive: true },
            data: { isActive: false },
          },
        },
      },
    })

    await this.memberUtil.publishEvent(new MemberDowngradeEvent(updated))
  }

  // private async getReferrerData(
  //   member: TMember,
  //   kwargs: Omit<Prisma.MemberFindUniqueOrThrowArgs, 'where'> = {},
  // ): Promise<MemberData> {
  //   if (member.friendCode) {
  //     const referrer = await this.findOne({
  //       ...kwargs,
  //       where: { referralCode: member.friendCode },
  //     })
  //     if (referrer) {
  //       const referrerData = await this.getRecentData(referrer)
  //       return referrerData.setIsReferrer(true)
  //     }
  //   }
  //   return null
  // }

  // private async getRecentData(member: TMember): Promise<MemberData> {
  //   const tierRecent = await this.prisma.memberTier.findFirst({
  //     where: { memberId: member.id, isActive: true },
  //     orderBy: [{ id: 'desc' }],
  //   })

  //   if (tierRecent) {
  //     return MemberData.make(member, tierRecent)
  //   }

  //   const tierChart = this.tierService.getChart()
  //   const tierData = tierChart.getStats(member.tierId)
  //   const newMemberTier = await this.prisma.memberTier.create({
  //     data: {
  //       memberId: member.id,
  //       currTierId: member.tierId,
  //       minTierId: member.minTierId,
  //       personalAmount: member.personalAmount,
  //       referralAmount: member.referralAmount,
  //       renewalAmount: tierData.curr.limitAmount,
  //       upgradeAmount: tierData.next.limitAmount,
  //       expiryDate: member.expiryDate,
  //       isActive: true,
  //       createdAt: member.createdAt,
  //       updatedAt: member.createdAt,
  //     },
  //   })
  //   return MemberData.make(member, newMemberTier)
  // }

  // async earnHighestBirthInvoice(month: number, memberIds: number[]): Promise<Date> {
  //   const nowDate = this.helperService.dateNow()
  //   const dateRange = this.helperService.dateRange(nowDate)
  //   const startOfDay = this.helperService.dateCreate(nowDate, { startOfDay: true })

  //   const members = await this.prisma.member.findMany({
  //     where: {
  //       isActive: true,
  //       hasBirthPurchased: false,
  //       birthMonth: month,
  //       id: { in: memberIds },
  //     },
  //   })

  //   for (const member of members) {
  //     const birthPoint = await this.prisma.memberPoint.findFirst({
  //       where: {
  //         memberId: member.id,
  //         isBirth: true,
  //         isFirst: false,
  //         createdAt: {
  //           gte: dateRange.startOfMonth,
  //           lte: dateRange.endOfMonth,
  //         },
  //       },
  //       orderBy: [{ invoiceAmount: 'desc' }],
  //     })

  //     if (birthPoint) {
  //       const tierChart = this.tierService.getChart()
  //       const memberTier = tierChart.getInfo(member.tierId)
  //       const newPoint = TierUtil.round(birthPoint.point * (memberTier.birthdayRatio - 1))

  //       await this.prisma.member.update({
  //         where: { id: member.id },
  //         data: {
  //           hasBirthPurchased: true,
  //           hasBirthPurchasedAt: startOfDay,
  //           updatedAt: startOfDay,
  //           points: {
  //             create: {
  //               invoiceId: birthPoint.invoiceId,
  //               invoiceAmount: birthPoint.invoiceAmount,
  //               source: EnumPointSource.SYSTEM,
  //               action: EnumPointAction.EARN,
  //               isBirth: true,
  //               tierId: memberTier.id,
  //               multipleRatio: memberTier.birthdayRatio,
  //               point: newPoint,
  //               createdAt: startOfDay,
  //               updatedAt: startOfDay,
  //             },
  //           },
  //         },
  //       })
  //     }
  //   }
  //   return nowDate
  // }

  // async earnPointFromInvoices(issuedAt: Date | string): Promise<Date> {
  //   issuedAt = this.helperService.dateCreateFromGeneric(issuedAt)
  //   const sinceInvoice = await this.invoiceUtil.getFirstInvoice(issuedAt)
  //   if (!sinceInvoice) {
  //     return
  //   }

  //   const tierChart = this.tierService.getChart()

  //   let sinceDate = this.helperService.dateCreate(sinceInvoice.issuedAt, { startOfDay: true })
  //   const untilDate = this.helperService.dateCreate(issuedAt, { startOfDay: true })

  //   while (sinceDate <= untilDate) {
  //     const grpInvoices = await this.invoiceUtil.getEarnInvoices(sinceDate)

  //     for (const [key, dateInvoices] of Object.entries(grpInvoices)) {
  //       let usedInvoiceIds = []
  //       for (const invoice of dateInvoices) {
  //         if (usedInvoiceIds.includes(invoice.id)) {
  //           continue
  //         }

  //         const member = await this.findOrFail(invoice.memberId)
  //         const memberData = await this.getRecentData(member)

  //         const memberTier = tierChart.getInfo(member.tierId)
  //         const memberRatio = member.hasFirstPurchased
  //           ? TierUtil.ratio(memberTier.personalRate)
  //           : TierUtil.ratio(memberTier.initialRate)
  //         const memberInvoices = member.hasFirstPurchased
  //           ? [invoice]
  //           : dateInvoices.filter(inv => inv.memberId === memberData.id)

  //         // const invoiceData = this.getDataFromInvoices(memberInvoices)
  //         const invoiceData = this.invoiceUtil.getData(memberInvoices)
  //         const { tierData, tierValue, invoiceIds } = memberData.hasFirstPurchased
  //           ? tierChart.calculateData(memberData, invoiceData)
  //           : tierChart.calculateDataInFirstPurchase(memberData, invoiceData)

  //         const pointExpiryDate = this.memberUtil.getPointExpirationDate(sinceDate)
  //         const tierExpiryDate = this.memberUtil.getTierExpirationDate(sinceDate)
  //         const isBirthMonth = this.helperService.dateIsSet(invoice.issuedAt, {
  //           month: member.birthMonth,
  //         })

  //         if (tierData.isUpgrade()) {
  //           memberData
  //             .addMemberTier({
  //               id: memberData.orgMemberTier.id,
  //               personalAmount: tierValue.usageAmount,
  //             })
  //             .addMemberTier({
  //               type: EnumTierMethod.UPGRADE,
  //               prevTierId: tierData.info.id,
  //               currTierId: tierData.curr.id,
  //               invoiceId: invoiceIds[invoiceIds.length - 1],
  //               personalAmount: tierValue.currAmount,
  //               excessAmount: tierValue.excessAmount,
  //               renewalAmount: tierData.curr.limitAmount,
  //               upgradeAmount: tierData.next.limitAmount,
  //               expiryDate: tierExpiryDate,
  //               createdAt: sinceDate,
  //               updatedAt: sinceDate,
  //             })
  //             .addMemberPoint({
  //               type: EnumMemberPointType.REWARD,
  //               tierId: memberData.orgTierId,
  //               invoiceId: invoiceIds[invoiceIds.length - 1],
  //               invoiceAmount: tierValue.usageAmount,
  //               isFirst: !memberData.hasFirstPurchased,
  //               isBirth: memberData.hasBirthPurchased,
  //               multipleRatio: memberRatio,
  //               point: TierUtil.round(memberRatio * tierValue.usageAmount),
  //               expiryDate: pointExpiryDate,
  //               createdAt: sinceDate,
  //               updatedAt: sinceDate,
  //             })
  //             .addMemberPoint({
  //               type: EnumMemberPointType.REWARD,
  //               tierId: tierData.curr.id,
  //               invoiceId: invoiceIds[invoiceIds.length - 1],
  //               invoiceAmount: tierValue.currAmount,
  //               multipleRatio: memberRatio,
  //               isFirst: !memberData.hasFirstPurchased,
  //               isBirth: memberData.hasBirthPurchased,
  //               point: TierUtil.round(memberRatio * tierValue.currAmount),
  //               expiryDate: pointExpiryDate,
  //               createdAt: sinceDate,
  //               updatedAt: sinceDate,
  //             })
  //         } else {
  //           memberData
  //             .addMemberTier({
  //               id: memberData.orgMemberTier.id,
  //               personalAmount: tierValue.usageAmount,
  //             })
  //             .addMemberPoint({
  //               type: EnumMemberPointType.REWARD,
  //               tierId: tierData.curr.id,
  //               invoiceId: invoiceIds[invoiceIds.length - 1],
  //               invoiceAmount: tierValue.usageAmount,
  //               isFirst: !memberData.hasFirstPurchased,
  //               isBirth: memberData.hasBirthPurchased,
  //               multipleRatio: memberRatio,
  //               point: TierUtil.round(memberRatio * tierValue.usageAmount),
  //               expiryDate: pointExpiryDate,
  //               createdAt: sinceDate,
  //               updatedAt: sinceDate,
  //             })
  //         }

  //         if (!member.hasFirstPurchased) {
  //           const referrerData = await this.getReferrerData(member)
  //           if (referrerData && referrerData.isActive) {
  //             const { tierData, tierValue } = tierChart.calculateData(referrerData, invoiceData)

  //             if (tierData.isUpgrade()) {
  //               referrerData.addMemberTier({
  //                 type: EnumTierMethod.UPGRADE,
  //                 prevTierId: tierData.info.id,
  //                 currTierId: tierData.curr.id,
  //                 invoiceId: invoiceIds[invoiceIds.length - 1],
  //                 personalAmount: tierValue.currAmount,
  //                 referralAmount: 0,
  //                 excessAmount: tierValue.excessAmount,
  //                 renewalAmount: tierData.curr.limitAmount,
  //                 upgradeAmount: tierData.next.limitAmount,
  //                 expiryDate: tierExpiryDate,
  //                 createdAt: sinceDate,
  //                 updatedAt: sinceDate,
  //               })
  //             } else {
  //               referrerData.addMemberTier({
  //                 id: referrerData.orgMemberTier.id,
  //                 referralAmount: tierValue.totalAmount,
  //               })

  //               if (tierData.curr.referralRate && referrerData.hasDiamondAchieved) {
  //                 referrerData.addMemberPoint({
  //                   type: EnumMemberPointType.REFER,
  //                   refereeId: memberData.id,
  //                   tierId: referrerData.tierId,
  //                   invoiceId: invoiceIds[invoiceIds.length - 1],
  //                   invoiceAmount: tierValue.usageAmount,
  //                   multipleRatio: TierUtil.ratio(tierData.curr.referralRate),
  //                   point: TierUtil.convert(tierValue.usageAmount, tierData.curr.referralRate),
  //                   expiryDate: pointExpiryDate,
  //                   createdAt: sinceDate,
  //                   updatedAt: sinceDate,
  //                 })
  //               }
  //             }

  //             referrerData.addRefereeData(memberData).setDiamondAchieved(tierData.isUpgrade())
  //           }
  //         }

  //         usedInvoiceIds = [...usedInvoiceIds, ...invoiceIds]

  //         // Update member flags
  //         memberData
  //           .setFirstPurchased()
  //           .setBirthPurchased(isBirthMonth)
  //           .setDiamondAchieved(tierData.isUpgrade())

  //         await this.prisma.$transaction(async tx => {
  //           await tx.member.update({
  //             where: { id: member.id },
  //             data: {
  //               tierId: memberData.tierId,
  //               minTierId: memberData.minTierId,
  //               expiryDate: memberData.expiryDate,
  //               pointBalance: memberData.pointBalance,
  //               maximumAmount: memberData.maximumAmount,
  //               personalAmount: memberData.personalAmount,
  //               referralAmount: memberData.referralAmount,
  //               hasFirstPurchased: memberData.hasFirstPurchased,
  //               hasFirstPurchasedAt: memberData.hasFirstPurchasedAt,
  //               hasBirthPurchased: memberData.hasBirthPurchased,
  //               hasBirthPurchasedAt: memberData.hasBirthPurchasedAt,
  //               hasDiamondAchieved: memberData.hasDiamondAchieved,
  //               hasDiamondAchievedAt: memberData.hasDiamondAchievedAt,
  //               updatedAt: memberData.updatedAt,
  //               invoices: {
  //                 updateMany: {
  //                   where: { id: { in: invoiceData.ids } },
  //                   data: { isEarned: true, updatedAt: memberData.updatedAt },
  //                 },
  //               },
  //               tiers: {
  //                 update: {
  //                   where: { id: memberData.orgMemberTier.id },
  //                   data: memberData.orgMemberTier.data,
  //                 },
  //                 createMany: {
  //                   data: memberData.tiers,
  //                   skipDuplicates: true,
  //                 },
  //               },
  //               points: {
  //                 createMany: {
  //                   data: memberData.points,
  //                   skipDuplicates: true,
  //                 },
  //               },
  //             },
  //           })

  //           if (memberData.hasReferrer()) {
  //             const refererData = memberData.getReferrerData()
  //             await tx.member.update({
  //               where: { id: refererData.id },
  //               data: {
  //                 tierId: refererData.tierId,
  //                 minTierId: refererData.minTierId,
  //                 expiryDate: refererData.expiryDate,
  //                 pointBalance: refererData.pointBalance,
  //                 maximumAmount: refererData.maximumAmount,
  //                 personalAmount: refererData.personalAmount,
  //                 referralAmount: refererData.referralAmount,
  //                 hasDiamondAchieved: refererData.hasDiamondAchieved,
  //                 hasDiamondAchievedAt: refererData.hasDiamondAchievedAt,
  //                 updatedAt: refererData.updatedAt,
  //                 tiers: {
  //                   update: {
  //                     where: { id: refererData.orgMemberTier.id },
  //                     data: refererData.orgMemberTier.data,
  //                   },
  //                   createMany: {
  //                     data: refererData.tiers,
  //                     skipDuplicates: true,
  //                   },
  //                 },
  //                 points: {
  //                   createMany: {
  //                     data: refererData.points,
  //                     skipDuplicates: true,
  //                   },
  //                 },
  //               },
  //             })
  //           }
  //         })
  //       }

  //       //  garbage collection (GC) to clean up unused memory
  //       grpInvoices[key] = null
  //     }

  //     sinceDate = this.helperService.dateForward(sinceDate, { day: 1 })
  //   }
  //   return issuedAt
  // }

  async generateMembershipCode(member: TMember): Promise<void> {
    await this.update(member.id, {
      code: this.memberUtil.generateCode(member.id),
      updatedAt: member.updatedAt, // keep last updated
    })
  }

  async grantWelcomeReward(member: TMember): Promise<void> {
    await this.memberPointService.applyTierReward({
      memberId: member.id,
      tierId: member.tierId,
      issuedAt: member.createdAt,
    })
  }
}

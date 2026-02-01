import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumVerificationChannel } from '@runtime/prisma-client'
import { EnumAuthLoginType } from 'lib/nest-auth'
import { HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumMemberActivityAction } from '../enums'
import {
  IMemberVerifyApproveOptions,
  IMemberVerifyCheckOptions,
  IMemberVerifyCreateOptions,
  IMemberVerifyIdentity,
  IMemberVerifyRandomOptions,
  TMemberVerification,
} from '../interfaces'

@Injectable()
export class MemberUtil {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  generateCode(memberId: number): string {
    const digits = this.config.getOrThrow<number>('module.member.codeDigits')
    return this.helperService.padZero(memberId, {
      length: digits,
      prefix: 'T',
    })
  }

  getPointExpirationDate(issuedAt: Date, expiresAfterYear?: number): Date {
    const numberOfYear = this.config.getOrThrow<number>('module.member.expiresIn')
    if (numberOfYear > 0 || expiresAfterYear > 0) {
      const endOfDay = this.helperService.dateCreate(issuedAt, { endOfDay: true })
      return this.helperService.dateForward(endOfDay, {
        year: expiresAfterYear || numberOfYear,
      })
    }
    return undefined
  }

  getTierExpirationDate(issuedAt: Date, expiresAfterYear?: number): Date {
    const numberOfYear = this.config.getOrThrow<number>('module.member.expiresIn')
    if (numberOfYear > 0 || expiresAfterYear > 0) {
      const endOfDay = this.helperService.dateCreate(issuedAt, { endOfDay: true })
      return this.helperService.dateForward(endOfDay, {
        year: expiresAfterYear || numberOfYear,
      })
    }
    return undefined
  }

  async getPointRecents(
    id: number,
    pointRequire: number,
  ): Promise<{ date: Date; point: number }[]> {
    const results = []
    const nowDate = this.helperService.dateNow()

    let len = 0
    while (pointRequire > 0) {
      len += 2
      const recents = await this.getPointRecent(id, nowDate, len)
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
      // const recentPoint = await this.prisma.memberPoint.findFirst({
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
    const pointGroups = await this.prisma.memberPoint.groupBy({
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
    return pointGroups.map(pointGroup => ({
      date: pointGroup.expiryDate,
      point: pointGroup._sum.point,
    }))
  }

  async getPointBalance(id: number, issuedAt: Date): Promise<number> {
    const pointBalance = await this.prisma.memberPoint.aggregate({
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

  async randomToken(
    channel: EnumVerificationChannel,
    options: IMemberVerifyRandomOptions,
  ): Promise<TMemberVerification> {
    const isInspector = this.checkIsInspector(options?.memberData)

    if (!isInspector) {
      const nowDate = this.helperService.dateNow()
      const dateRange = this.helperService.dateRange(nowDate)

      const todayAttempts = await this.prisma.memberVerification.count({
        where: {
          channel,
          type: options.method,
          memberId: options?.memberData?.memberId,
          phone: options?.memberData?.phone,
          email: options?.memberData?.email,
          // isActive: true,
          createdAt: {
            gte: dateRange.startOfDay,
            lte: dateRange.endOfDay,
          },
        },
      })

      if (todayAttempts >= options.maxAttempts) {
        throw new BadRequestException({
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'auth.error.tokenAttemptMax',
        })
      }
    }

    const verifyData = this.createVerifyData({
      ...options,
      inspector: isInspector,
    })

    return await this.prisma.memberVerification.create({
      data: {
        channel,
        type: options.method,
        email: options?.memberData?.email,
        phone: options?.memberData?.phone,
        memberId: options?.memberData?.memberId,
        code: verifyData.code,
        expiresAt: verifyData.expired,
        isExpired: true,
      },
    })
  }

  async checkToken(token: string, options: IMemberVerifyCheckOptions): Promise<boolean> {
    if (!token) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenRequired',
      })
    }

    return await this.prisma.memberVerification.exists({
      channel: options.channel,
      type: options.method,
      email: options?.email,
      phone: options?.phone,
      memberId: options?.memberId,
      code: token,
      isActive: true,
      isExpired: false,
      isVerified: true,
    })
  }

  async approveToken(token: string, options: IMemberVerifyApproveOptions): Promise<boolean> {
    const lastVerifyData = await this.prisma.memberVerification.findFirst({
      where: {
        isActive: true,
        channel: options.channel,
        type: options.method,
        email: options?.email,
        phone: options?.phone,
        memberId: options?.memberId,
      },
      orderBy: { id: 'desc' },
    })

    if (!lastVerifyData || lastVerifyData.code !== token) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenExpired',
      })
    }

    if (lastVerifyData.isVerified) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenUsed',
      })
    }

    const nowDate = this.helperService.dateNow()
    if (nowDate >= lastVerifyData.expiresAt) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenExpired',
      })
    }

    const { id: verifyId, memberId, phone, email } = lastVerifyData

    await this.prisma.$transaction([
      this.prisma.memberVerification.updateMany({
        where: { memberId, phone, email, isActive: true, id: { lt: verifyId } },
        data: { isActive: false },
      }),
      this.prisma.memberVerification.update({
        where: { id: verifyId },
        data: { isActive: true, isVerified: true, verifiedAt: nowDate },
      }),
    ])

    return true
  }

  private checkIsInspector(memberData: Partial<IMemberVerifyIdentity>): boolean {
    if (memberData?.email) {
      const inspectors = this.config.get<string[]>('auth.token.email.inspectors', [])
      if (inspectors.length) {
        return inspectors.includes('*') || inspectors.includes(memberData.email)
      }
    }

    if (memberData?.phone) {
      const inspectors = this.config.get<string[]>('auth.token.phone.inspectors', [])
      if (inspectors.length) {
        return inspectors.includes('*') || inspectors.includes(memberData.phone)
      }
    }
    return false
  }

  private createVerifyData(options: IMemberVerifyCreateOptions): { code: string; expired: Date } {
    const digits = '1234567890'
    const sinceDate = this.helperService.dateNow()
    const untilDate = this.helperService.dateForward(sinceDate, { seconds: options.seconds })

    const code = options?.inspector
      ? digits.repeat(Math.ceil(length / digits.length)).slice(0, length)
      : this.helperService.randomString(options.length, { numeric: options.numeric })

    if (options?.hashed) {
      const hashed = this.helperService.base64Encrypt(
        JSON.stringify({
          code,
          hash: this.helperService.randomString(options.length, { safe: true }),
          sinceDate,
          untilDate,
        }),
      )
      return { expired: untilDate, code: hashed }
    }

    return { expired: untilDate, code }
  }

  static getActivityLogin(loginType: EnumAuthLoginType): EnumMemberActivityAction {
    let action: EnumMemberActivityAction = undefined
    switch (loginType) {
      case EnumAuthLoginType.CREDENTIAL:
        action = EnumMemberActivityAction.USER_LOGIN_CREDENTIAL
        break
      case EnumAuthLoginType.SOCIAL_GOOGLE:
        action = EnumMemberActivityAction.USER_LOGIN_GOOGLE
        break
      case EnumAuthLoginType.SOCIAL_APPLE:
        action = EnumMemberActivityAction.USER_LOGIN_APPLE
        break
    }
    return action
  }
}

import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EnumVerificationChannel } from '@runtime/prisma-client'
import { HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import {
  IMemberVerifyApproveOptions,
  IMemberVerifyCheckOptions,
  IMemberVerifyCreateOptions,
  IMemberVerifyIdentity,
  IMemberVerifyRandomOptions,
  TMemberVerification,
} from '../interfaces'

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly helperService: HelperService,
  ) {}

  @Cron(CronExpression.EVERY_2_HOURS)
  async cleanUpTokens(): Promise<Date> {
    const nowDate = this.helperService.dateNow()
    await this.prisma.memberVerification.updateMany({
      where: { isActive: true, isExpired: true, expiresAt: { lte: nowDate } },
      data: { isActive: false },
    })
    return nowDate
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
}

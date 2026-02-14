import { BadRequestException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EnumVerificationChannel } from '@runtime/prisma-client'
import { EnumAuthLoginType } from 'lib/nest-auth'
import { EventBus, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import { EnumMemberActivityAction } from '../enums/member.enum'
import {
  IMemberVerifyApproveOptions,
  IMemberVerifyCheckOptions,
  IMemberVerifyCreateOptions,
  IMemberVerifyIdentity,
  IMemberVerifyRandomOptions,
  TMemberVerification,
} from '../interfaces/member.interface'

@Injectable()
export class MemberUtil {
  private readonly _logger = new Logger(MemberUtil.name)

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly eventBus: EventBus,
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
      where: {
        channel: options.channel,
        type: options.method,
        email: options?.email,
        phone: options?.phone,
        memberId: options?.memberId,
        code: token,
        isActive: true,
        isVerified: true,
        isExpired: false,
      },
    })
  }

  async approveToken(token: string, options: IMemberVerifyApproveOptions): Promise<boolean> {
    const lastVerifyData = await this.prisma.memberVerification.findFirst({
      where: {
        channel: options.channel,
        type: options.method,
        email: options?.email,
        phone: options?.phone,
        memberId: options?.memberId,
      },
      orderBy: { id: 'desc' },
    })

    if (!lastVerifyData || !lastVerifyData.isActive) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenInvalid',
      })
    }

    const nowDate = this.helperService.dateNow()
    if (lastVerifyData.code !== token || nowDate >= lastVerifyData.expiresAt) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenExpired',
      })
    }

    if (!lastVerifyData.isVerified) {
      await this.prisma.memberVerification.update({
        where: { id: lastVerifyData.id },
        data: { isActive: true, isVerified: true, verifiedAt: nowDate },
      })
    }

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
      : this.helperService.randomString(options.length, {
          numeric: options.numeric,
          upperCase: true,
        })

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
        action = EnumMemberActivityAction.LOGIN_CREDENTIAL
        break
      case EnumAuthLoginType.SOCIAL_GOOGLE:
        action = EnumMemberActivityAction.LOGIN_GOOGLE
        break
      case EnumAuthLoginType.SOCIAL_APPLE:
        action = EnumMemberActivityAction.LOGIN_APPLE
        break
    }
    return action
  }
}

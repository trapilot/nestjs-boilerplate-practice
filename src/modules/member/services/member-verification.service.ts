import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Cron, CronExpression } from '@nestjs/schedule'
import { APP_TIMEZONE, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'
import {
  IVerificationCodeData,
  IVerificationCreateOptions,
  IVerificationRandomOptions,
  TMemberVerifyHistory,
} from '../interfaces'

@Injectable()
export class MemberVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly helperService: HelperService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: APP_TIMEZONE })
  private async clearExpiredVerifyTokens() {
    const dateNow = this.helperService.dateCreate()
    await this.prisma.memberVerifyHistory.updateMany({
      where: { isActive: true, isExpired: true, expiresAt: { lte: dateNow } },
      data: { isActive: false },
    })
  }

  async random(
    data: IVerificationCreateOptions,
    options: IVerificationRandomOptions & { maxAttempts: number },
  ): Promise<TMemberVerifyHistory> {
    const dateNow = this.helperService.dateCreate()
    const dateRange = this.helperService.dateRange(dateNow)

    const inspector = this.checkIsInspector(data)
    const todayAttempts = await this.prisma.memberVerifyHistory.count({
      where: {
        ...data,
        // isActive: true,
        createdAt: {
          gte: dateRange.startOfDay,
          lte: dateRange.endOfDay,
        },
      },
    })

    if (todayAttempts >= options.maxAttempts && !inspector) {
      throw new BadRequestException({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'auth.error.tokenAttemptMax',
      })
    }

    const { code, expired } = this.createCodeRandom({
      inspector: inspector,
      numeric: options.numeric,
      seconds: options.seconds,
      length: options.length,
    })

    return await this.prisma.memberVerifyHistory.create({
      data: { ...data, code, isExpired: true, expiresAt: expired },
    })
  }

  async check(code: string, data: IVerificationCreateOptions): Promise<boolean> {
    if (!code) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenRequired',
      })
    }

    const tokens = await this.prisma.memberVerifyHistory.count({
      where: { ...data, code, isActive: true, isVerified: true },
    })

    if (tokens === 0) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenInvalid',
      })
    }

    return true
  }

  async verify(code: string, data: IVerificationCreateOptions): Promise<boolean> {
    const token = await this.prisma.memberVerifyHistory.findFirst({
      where: { isActive: true, ...data },
      orderBy: { id: 'desc' },
    })

    if (!token || token.code !== code) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenExpired',
      })
    }

    if (token.isVerified) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenUsed',
      })
    }

    const dateNow = this.helperService.dateCreate()
    if (dateNow >= token.expiresAt) {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'auth.error.tokenExpired',
      })
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.memberVerifyHistory.updateMany({
        where: {
          memberId: token.memberId,
          phone: token.phone,
          email: token.email,
          isActive: true,
        },
        data: { isActive: false },
      })
      await tx.memberVerifyHistory.update({
        where: { id: token.id },
        data: { isActive: true, isVerified: true, verifiedAt: dateNow },
      })
    })

    return true
  }

  private checkIsInspector(data: IVerificationCreateOptions): boolean {
    if (data?.email) {
      const inspectors = this.config.get<string[]>('auth.token.email.inspectors', [])
      if (inspectors.length) {
        return inspectors.includes('*') || inspectors.includes(data.email)
      }
    }

    if (data?.phone) {
      const inspectors = this.config.get<string[]>('auth.token.phone.inspectors', [])
      if (inspectors.length) {
        return inspectors.includes('*') || inspectors.includes(data.phone)
      }
    }
    return false
  }

  private createCodeDefault(length: number, _numeric: boolean = false): string {
    const text = '1234567890'
    return text.repeat(Math.ceil(length / text.length)).slice(0, length)
  }

  private createCodeRandom(options: IVerificationRandomOptions): IVerificationCodeData {
    const dateNow = this.helperService.dateCreate()
    const expired = this.helperService.dateForward(dateNow, { seconds: options.seconds })

    const code = options?.code
      ? options.code
      : options?.inspector === true
        ? this.createCodeDefault(options.length, options.numeric)
        : this.helperService.randomString(options.length, { numeric: options.numeric })

    return { code, expired }
  }
}

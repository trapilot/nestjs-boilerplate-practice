import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'

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
}

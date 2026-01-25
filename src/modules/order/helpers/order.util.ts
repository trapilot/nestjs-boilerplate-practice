import { Injectable } from '@nestjs/common'
import { EnumSlipType } from '@runtime/prisma-client'
import { EnumDateFormat, HelperService } from 'lib/nest-core'
import { PrismaService } from 'lib/nest-prisma'

@Injectable()
export class OrderUtil {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
  ) {}

  async getOrderNumber(issuedAt: Date): Promise<string> {
    const key = this.helperService.dateFormat(issuedAt, EnumDateFormat.DATE_REFERENCE)
    const type = EnumSlipType.ORDER
    const slip = await this.prisma.slipCounter.upsert({
      where: { type_key: { key, type } },
      create: { type, key, sequence: 1 },
      update: { sequence: { increment: 1 } },
    })

    const raw = `${process.env.APP_SECRET_KEY}:${type}:${key}:${slip.sequence}`
    const hash = this.helperService.hashCreate(raw, { algorithm: 'sha256' })
    const code = this.helperService.baseEncode(hash, 36)

    return this.helperService.stringFormat(code, {
      length: 16,
      format: 'uppercase',
      slices: { delimiter: '-', parts: [4, 4, 4, 4] },
    })
  }
}

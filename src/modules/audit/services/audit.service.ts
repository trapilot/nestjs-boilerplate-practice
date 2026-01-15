import { Injectable } from '@nestjs/common'
import { PrismaService } from 'lib/nest-prisma'

@Injectable()
export class AuditService {
  constructor(private readonly _prisma: PrismaService) {}
}

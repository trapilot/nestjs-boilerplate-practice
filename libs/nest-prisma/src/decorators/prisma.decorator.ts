import { Inject } from '@nestjs/common'
import { PRISMA_TENANT_TOKEN } from '../constants'

export const InjectPrisma = () => Inject(PRISMA_TENANT_TOKEN)

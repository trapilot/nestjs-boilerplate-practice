import { Prisma } from '@runtime/prisma-client'

export const PRISMA_MODULE_OPTION_TOKEN = 'PRISMA_MODULE_OPTION_TOKEN'

export const PRISMA_TENANT_TOKEN = 'PRISMA_TENANT_TOKEN'

export const PRISMA_READ_OPERATIONS: Prisma.PrismaAction[] = [
  'findUnique',
  'findUniqueOrThrow',
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'queryRaw',
  'aggregate',
  'count',
  'findRaw',
  'groupBy',
]

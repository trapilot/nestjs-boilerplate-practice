import { Prisma } from '@runtime/prisma-client'

export const PRISMA_OPTIONS = 'PRISMA_OPTIONS'

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

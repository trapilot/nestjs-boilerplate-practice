import { PrismaClient } from '@runtime/prisma-client'
import { withExtension, withReplica } from '../extensions'

/* eslint-disable @typescript-eslint/no-unused-vars */
export const __clientWithExtends = new PrismaClient({ accelerateUrl: 'x' })
  .$extends(withExtension)
  .$extends(withReplica([]))

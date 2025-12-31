import { AsyncLocalStorage } from 'node:async_hooks'
import { IPrismaContext } from '../interfaces'

export const PrismaContext = new AsyncLocalStorage<IPrismaContext>()

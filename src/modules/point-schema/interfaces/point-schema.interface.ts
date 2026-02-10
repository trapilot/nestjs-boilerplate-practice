import {
  PointSchema,
  PointSchemaCondition,
  PointSchemaLimit,
  PointSchemaReward,
} from '@runtime/prisma-client'

export type TPointSchemaCondition = PointSchemaCondition
export type TPointSchemaLimit = PointSchemaLimit
export type TPointSchemaReward = PointSchemaReward

export type TPointSchema = PointSchema & {
  conditions?: PointSchemaCondition[]
  limits?: PointSchemaLimit[]
  rewards?: PointSchemaReward[]
}

export interface IPointSchemaContext<T = number | string> {
  memberId: number
  issuedAt: Date
  compareValue: T
}

/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export enum EnumQueuePriority {
  CRITICAL = 0, // system, blocking, incident
  HIGH = 1, // user-facing, realtime
  MEDIUM = 5, // default
  LOW = 10, // background
  VERY_LOW = 20, // maintenance, cleanup
}

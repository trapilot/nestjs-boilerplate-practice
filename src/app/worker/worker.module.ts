import { DynamicModule, Module } from '@nestjs/common'
import { InvoiceModule } from 'src/modules/invoice'
import { InvoiceExpireOverDueTask } from 'src/modules/invoice/tasks'
import {
  MemberEarnHighestBirthPurchasedTask,
  MemberEarnPointTask,
  MemberModule,
  MemberReleasePointTask,
  MemberResetBirthPurchasedTask,
  MemberResetPointTask,
  MemberResetTierTask,
} from 'src/modules/member'
import { PushModule, PushSendNotificationTask } from 'src/modules/push'

@Module({})
export class WorkerModule {
  static register(): DynamicModule {
    return {
      module: WorkerModule,
      providers: [
        PushSendNotificationTask,
        MemberResetBirthPurchasedTask,
        MemberResetTierTask,
        MemberResetPointTask,
        MemberEarnPointTask,
        MemberEarnHighestBirthPurchasedTask,
        MemberReleasePointTask,
        InvoiceExpireOverDueTask,
      ],
      imports: [PushModule, MemberModule, InvoiceModule],
    }
  }
}

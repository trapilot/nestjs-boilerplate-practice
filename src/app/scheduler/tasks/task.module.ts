import { Module } from '@nestjs/common'
import { CartMockTask, CartModule } from 'modules/cart'
import { InvoiceMockTask, InvoiceModule } from 'modules/invoice'
import { MemberMockTask, MemberModule, MemberTask } from 'modules/member'
import { ProductMockTask, ProductModule } from 'modules/product'
import { PushModule, PushTask } from 'modules/push'
import { SettingModule, SettingTask } from 'modules/setting'
import { TierModule } from 'modules/tier'
import { UserModule, UserTask } from 'modules/user'

@Module({
  providers: [
    PushTask,
    SettingTask,
    MemberTask,
    UserTask,
    InvoiceMockTask,
    MemberMockTask,
    CartMockTask,
    ProductMockTask,
  ],
  imports: [
    PushModule,
    SettingModule,
    MemberModule,
    UserModule,
    InvoiceModule,
    CartModule,
    TierModule,
    ProductModule,
  ],
})
export class TaskModule {}

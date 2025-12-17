import { DynamicModule, Module } from '@nestjs/common'
import { InvoiceModule } from 'modules/invoice'
import { MemberModule } from 'modules/member'
import { PushModule } from 'modules/push'

@Module({})
export class WorkerModule {
  static register(): DynamicModule {
    return {
      module: WorkerModule,
      providers: [...PushModule.tasks(), ...MemberModule.tasks(), ...InvoiceModule.tasks()],
      imports: [PushModule, MemberModule, InvoiceModule],
    }
  }
}

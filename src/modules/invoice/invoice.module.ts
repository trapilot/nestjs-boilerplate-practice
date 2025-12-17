import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { InvoiceAdminController, InvoiceAppController } from './controllers'
import { InvoiceService } from './services'
import { InvoiceExpireOverDueTask } from './tasks'

@Module({
  providers: [InvoiceService],
  exports: [InvoiceService],
  imports: [],
})
export class InvoiceModule extends ModuleBase {
  static _tasks = [InvoiceExpireOverDueTask]
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [InvoiceAdminController],
    [ENUM_APP_API_TYPE.APP]: [InvoiceAppController],
  }
}

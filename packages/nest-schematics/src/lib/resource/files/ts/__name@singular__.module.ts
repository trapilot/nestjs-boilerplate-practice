import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { <%= singular(classify(name)) %>AdminController } from './controllers'
import { <%= singular(classify(name)) %>Service } from './services'

@Module({
  providers: [<%= singular(classify(name)) %>Service],
  exports: [<%= singular(classify(name)) %>Service],
  imports: [],
})
export class <%= singular(classify(name)) %>Module extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [<%= singular(classify(name)) %>AdminController],
  }
}


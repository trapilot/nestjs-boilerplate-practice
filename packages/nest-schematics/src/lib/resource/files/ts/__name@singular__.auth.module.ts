import { Module } from '@nestjs/common'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
import { ENUM_APP_API_TYPE, ModuleBase } from 'lib/nest-core'
import { <%= singular(classify(name)) %>AuthController } from './controllers'
import { <%= singular(classify(name)) %>AuthService } from './services'

@Module({
  providers: [
    {
      provide: ENUM_AUTH_SCOPE_TYPE.<%= authType %>,
      useClass: <%= singular(classify(name)) %>AuthService,
    },
  ],
  exports: [ENUM_AUTH_SCOPE_TYPE.<%= authType %>],
  imports: [],
})
export class <%= singular(classify(name)) %>AuthModule extends ModuleBase {
  static _controllers = {
    [ENUM_APP_API_TYPE]: [<%= singular(classify(name)) %>AuthController],
  }
}

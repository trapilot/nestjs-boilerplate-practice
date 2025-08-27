import { Module } from '@nestjs/common'
import { ENUM_AUTH_SCOPE_TYPE } from 'lib/nest-auth'
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
export class <%= singular(classify(name)) %>AuthModule {}

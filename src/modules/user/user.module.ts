import { Module } from '@nestjs/common'
import { UserService } from './services'

@Module({
  providers: [UserService],
  exports: [UserService],
  imports: [],
})
export class UserModule {}

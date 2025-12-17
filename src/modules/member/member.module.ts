import { Module } from '@nestjs/common'
import { ENUM_APP_API_TYPE, ENUM_APP_CMD_TYPE, ModuleBase } from 'lib/nest-core'
import { TierModule } from 'modules/tier'
import { MemberSeedCommand } from './commands'
import { MemberAdminController, MemberAppController } from './controllers'
import { MemberService } from './services'
import {
  MemberEarnHighestBirthPurchasedTask,
  MemberEarnPointTask,
  MemberReleasePointTask,
  MemberResetBirthPurchasedTask,
  MemberResetPointTask,
  MemberResetTierTask,
} from './tasks'

@Module({
  providers: [MemberService],
  exports: [MemberService],
  imports: [TierModule],
})
export class MemberModule extends ModuleBase {
  static _tasks = [
    MemberResetBirthPurchasedTask,
    MemberResetTierTask,
    MemberResetPointTask,
    MemberEarnPointTask,
    MemberEarnHighestBirthPurchasedTask,
    MemberReleasePointTask,
  ]
  static _controllers = {
    [ENUM_APP_API_TYPE.CMS]: [MemberAdminController],
    [ENUM_APP_API_TYPE.APP]: [MemberAppController],
  }
  static _commands = {
    [ENUM_APP_CMD_TYPE.SEED]: [MemberSeedCommand],
  }
}

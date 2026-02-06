import { Injectable } from '@nestjs/common'
import { EnumAuthLoginType } from 'lib/nest-auth'
import { Enum<%= singular(classify(name)) %>ActivityAction } from '../enums/<%= singular(lowercased(name)) %>.enum'

@Injectable()
export class <%= singular(classify(name)) %>Util {
  static getActivityLogin(loginType: EnumAuthLoginType): Enum<%= singular(classify(name)) %>ActivityAction {
    let action: Enum<%= singular(classify(name)) %>ActivityAction = undefined
    switch (loginType) {
      case EnumAuthLoginType.CREDENTIAL:
        action = Enum<%= singular(classify(name)) %>ActivityAction.LOGIN_CREDENTIAL
        break
    }
    return action
  }
}

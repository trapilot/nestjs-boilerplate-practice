import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import { Injectable } from '@nestjs/common'
import { ENUM_AUTH_ABILITY_ACTION } from '../enums'
import {
  IAuthAbility,
  IAuthAbilityFlat,
  IAuthAbilityHandlerCallback,
  IAuthAbilityRule,
  IAuthJwtPermission,
} from '../interfaces'
import { AuthAbilityHelper } from '../utils'

@Injectable()
export class AuthUserAbilityFactory {
  defineFromRequest(permissions: IAuthAbility[] = []) {
    const { can, build } = new AbilityBuilder<IAuthAbilityRule>(createPrismaAbility)
    for (const permission of permissions) {
      const abilities = this.mappingFromRequest(permission)

      for (const ability of abilities) {
        can(ability.action, ability.subject)
      }
    }

    return build()
  }

  parseFromRequest(decryptPermissions: IAuthJwtPermission = []): IAuthAbility[] {
    const abilities: IAuthAbility[] = []
    const subjects = AuthAbilityHelper.getSubjects()

    for (const subjectIndex of Object.keys(decryptPermissions)) {
      const subject = subjects[subjectIndex]
      const bitwise = decryptPermissions[subjectIndex] ?? 0

      const actions = AuthAbilityHelper.toActions(bitwise)
      if (actions.length > 0) {
        abilities.push({ subject, actions })
      }
    }
    return abilities
  }

  mappingFromRequest({ subject, actions }: IAuthAbility): IAuthAbilityFlat[] {
    return actions.map((action: ENUM_AUTH_ABILITY_ACTION) => ({
      action,
      subject,
    }))
  }

  handlerAbilities(abilities: IAuthAbility[]): IAuthAbilityHandlerCallback[] {
    return abilities
      .map(({ subject, actions }) => {
        return actions
          .map((action) => (ability: IAuthAbilityRule) => ability.can(action, subject))
          .flat(1)
      })
      .flat(1)
  }
}

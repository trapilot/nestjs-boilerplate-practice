import { AbilityBuilder } from '@casl/ability'
import { createPrismaAbility } from '@casl/prisma'
import {
  AuthAbilityContext,
  AuthAbilityFactory,
  AuthJwtAccessPayloadDto,
  IAuthAbility,
  IAuthAbilityRule,
  IAuthPayloadPermission,
} from 'lib/nest-auth'

export class UserAbilityFactory extends AuthAbilityFactory {
  private get subjects(): string[] {
    if (!this._subjects) {
      const { subjects } = AuthAbilityContext.getConfig()
      this._subjects = subjects
    }
    return this._subjects
  }

  private get actions(): string[] {
    if (!this._actions) {
      const { actions } = AuthAbilityContext.getConfig()
      this._actions = actions
    }
    return this._actions
  }

  defineFromRequest(payload: AuthJwtAccessPayloadDto): IAuthAbilityRule {
    const userPermissions = this.parseFromRequest(payload)

    const { can, build } = new AbilityBuilder<IAuthAbilityRule>(createPrismaAbility)
    for (const permission of userPermissions) {
      const abilities = this.mappingFromRequest(permission)

      for (const ability of abilities) {
        can(ability.action, ability.subject)
      }
    }

    return build()
  }

  parseFromRequest(payload: AuthJwtAccessPayloadDto): IAuthAbility[] {
    const abilities: IAuthAbility[] = []
    const permissions: IAuthPayloadPermission[] = payload.user?.permissions || []

    for (const subjectIndex of Object.keys(permissions)) {
      const subject = this.subjects[subjectIndex]
      const bitwise = permissions[subjectIndex] ?? 0

      const actions = this.actions.filter((_, index) => (bitwise & (1 << index)) !== 0)
      if (actions.length > 0) {
        abilities.push({ subject, actions })
      }
    }
    return abilities
  }
}

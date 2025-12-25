import { AuthJwtAccessPayloadDto } from '../dtos'
import {
  IAuthAbility,
  IAuthAbilityFlat,
  IAuthAbilityHandlerCallback,
  IAuthAbilityRule,
} from '../interfaces'

export abstract class AuthFactory {
  protected _subjects?: string[]
  protected _actions?: string[]

  abstract defineFromRequest(payload: AuthJwtAccessPayloadDto): IAuthAbilityRule

  abstract parseFromRequest(payload: AuthJwtAccessPayloadDto): IAuthAbility[]

  mappingFromRequest({ subject, actions }: IAuthAbility): IAuthAbilityFlat[] {
    return actions.map((action: string) => ({
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

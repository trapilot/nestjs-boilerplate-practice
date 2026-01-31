import {
  IAuthAbility,
  IAuthAbilityFlat,
  IAuthAbilityHandlerCallback,
  IAuthAbilityRule,
  IAuthJwtPayload,
} from '../interfaces'

export abstract class AuthFactory {
  protected _subjects?: string[]
  protected _actions?: string[]

  abstract defineFromRequest(payload: IAuthJwtPayload): IAuthAbilityRule

  abstract parseFromRequest(payload: IAuthJwtPayload): IAuthAbility[]

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
          .map(action => (ability: IAuthAbilityRule) => ability.can(action, subject))
          .flat(1)
      })
      .flat(1)
  }
}

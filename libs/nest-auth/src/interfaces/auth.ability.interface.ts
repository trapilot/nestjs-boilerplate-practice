import { InferSubjects, PureAbility } from '@casl/ability'

export interface IAuthAbility {
  subject: string
  actions: string[]
}

export interface IAuthAbilityFlat {
  subject: string
  action: string
}

export interface IAuthAbilityConfig {
  subjects: string[]
  actions: string[]
}

export type IAuthAbilitySubject = InferSubjects<string> | 'all'

export type IAuthAbilityRule = PureAbility<[string, IAuthAbilitySubject]>

export type IAuthAbilityHandlerCallback = (ability: IAuthAbilityRule) => boolean

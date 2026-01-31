import { IRequestApp } from 'lib/nest-core'
import { IAuthJwtPayload } from './auth.interface'

export class IAuthUserValidatorDto<U = any, P = any> {
  userData: U
  userPayload: P
}

export interface IAuthValidatorOptions {
  hmac?: boolean
}

export interface IAuthValidator<T = any> {
  validatePayload(
    payload: IAuthJwtPayload,
    request: IRequestApp,
    options: IAuthValidatorOptions,
  ): Promise<IAuthUserValidatorDto>

  getUserData(userId: number): Promise<T>
}

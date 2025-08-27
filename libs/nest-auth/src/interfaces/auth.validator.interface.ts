import { IRequestApp } from 'lib/nest-core'
import { AuthJwtAccessPayloadDto } from '../dtos'

export class IAuthUserValidatorDto<U = any, P = any> {
  userData: U
  userPayload: P
}

export interface IAuthValidatorOptions {
  hmac?: boolean
}

export interface IAuthValidator<T = any> {
  validatePayload(
    payload: AuthJwtAccessPayloadDto,
    request: IRequestApp,
    options: IAuthValidatorOptions,
  ): Promise<IAuthUserValidatorDto>

  getUserData(userId: number): Promise<T>
}

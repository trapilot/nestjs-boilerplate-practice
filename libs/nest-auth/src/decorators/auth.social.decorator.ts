import { UseGuards, applyDecorators } from '@nestjs/common'
import { AuthSocialAppleGuard, AuthSocialGoogleGuard } from '../guards'

export function AuthSocialGoogleProtected(): MethodDecorator {
  return applyDecorators(UseGuards(AuthSocialGoogleGuard))
}

export function AuthSocialAppleProtected(): MethodDecorator {
  return applyDecorators(UseGuards(AuthSocialAppleGuard))
}

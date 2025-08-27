import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ENUM_AUTH_LOGIN_FROM } from 'lib/nest-auth'
import { ENUM_GENDER_TYPE, IRequestApp, NestHelper } from 'lib/nest-core'
import { IResult, UAParser } from 'ua-parser-js'

export const RequestBookType = createParamDecorator(
  <T = string>(data: string, ctx: ExecutionContext): T => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return req?.query?.exportType as T
  },
)

export const RequestUserData = createParamDecorator(<T>(data: string, ctx: ExecutionContext): T => {
  const req = ctx.switchToHttp().getRequest<IRequestApp>()
  return (req[data] ?? null) as T
})

export const RequestUserAgent: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): IResult => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    try {
      const userAgent: IResult = JSON.parse(req.headers['x-user-agent'] as string)
      return userAgent
    } catch (err: unknown) {}

    const userAgentString = req.get('User-Agent') || req.headers['user-agent']
    const parserUserAgent = new UAParser(userAgentString)
    const userAgent: IResult = parserUserAgent.getResult()
    return userAgent
  },
)

export const RequestUserFrom: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): ENUM_AUTH_LOGIN_FROM => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    try {
      const originalUrl = req?.originalUrl ?? ''
      if (originalUrl.includes('/admin/')) {
        return ENUM_AUTH_LOGIN_FROM.CMS
      } else if (originalUrl.includes('/app/')) {
        return ENUM_AUTH_LOGIN_FROM.APP
      } else if (originalUrl.includes('/web/')) {
        return ENUM_AUTH_LOGIN_FROM.WEB
      }
    } catch (err: unknown) {}
    return null
  },
)

export const RequestUserToken: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return (req.headers['x-user-token'] as string) ?? undefined
  },
)

export const RequestUserOTP: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return (req.headers['x-user-otp'] as string) ?? undefined
  },
)

export const RequestUserOTT: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return (req.headers['x-user-ott'] as string) ?? undefined
  },
)

export const RequestUserLanguage: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const { __language } = ctx.switchToHttp().getRequest<IRequestApp>()
    return __language
  },
)

export const RequestUserGender: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    const userGender = (req.headers['x-user-gender'] as string) ?? undefined
    return NestHelper.keyOfEnums<string>(ENUM_GENDER_TYPE, userGender?.toUpperCase(), data)
  },
)

export const RequestCartVersion: () => ParameterDecorator = createParamDecorator(
  (data: string, ctx: ExecutionContext): number => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    const cartVersion = (req.headers['x-cart-version'] as string) ?? 0
    return Number(cartVersion)
  },
)

import { createParamDecorator, ExecutionContext, Ip } from '@nestjs/common'
import { EnumAuthLoginFrom } from 'lib/nest-auth'
import {
  AppUtil,
  EnumFileExtensionDocument,
  EnumUserType,
  EnumUtil,
  IRequestApp,
} from 'lib/nest-core'
import { IResult, UAParser } from 'ua-parser-js'

export const RequestBookType = createParamDecorator(
  (_data: string, ctx: ExecutionContext): EnumFileExtensionDocument => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return req?.query?.bookType as EnumFileExtensionDocument
  },
)

export function RequestUserIp(): ParameterDecorator {
  return Ip()
}

export const RequestUserData = createParamDecorator(<T>(data: string, ctx: ExecutionContext): T => {
  const req = ctx.switchToHttp().getRequest<IRequestApp>()
  return (req[data] ?? null) as T
})

export const RequestUserAgent: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): IResult => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    try {
      const userAgent: IResult = JSON.parse(req.headers['x-user-agent'] as string)
      return userAgent
    } catch {}
    return new UAParser(req.get('User-Agent') || req.headers['user-agent']).getResult()
  },
)

export const RequestUserFrom: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): EnumAuthLoginFrom => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return AppUtil.getLoginFrom(req?.originalUrl ?? '')
  },
)

export const RequestUserToken: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return (req.headers['x-user-token'] as string) ?? undefined
  },
)

export const RequestUserOTP: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return (req.headers['x-user-otp'] as string) ?? undefined
  },
)

export const RequestUserOTT: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    return (req.headers['x-user-ott'] as string) ?? undefined
  },
)

export const RequestUserLang: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): string => {
    const { __language } = ctx.switchToHttp().getRequest<IRequestApp>()
    return __language
  },
)

export const RequestUserType: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    const userType = (req.headers['x-user-type'] as string) ?? undefined
    return EnumUtil.findKey<string>(userType?.toLowerCase(), {
      enum: EnumUserType,
    })
  },
)

export const RequestUserVersion: () => ParameterDecorator = createParamDecorator(
  (_data: string, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<IRequestApp>()
    const userVersion = req.headers['x-user-version'] as string
    return userVersion
  },
)

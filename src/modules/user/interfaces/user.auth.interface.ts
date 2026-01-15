export interface IUserProfilePermission {
  group: boolean
  title: string
  context: string
  subjects: {
    title: string
    context: string
    subject: string
    isVisible: boolean
    actions: string[]
  }[]
}

export interface IContextUserPermission {
  [context: string]: IUserProfilePermission
}

export interface IUserRoleTransformOptions {
  key?: boolean
  level?: boolean
  flat?: boolean
}

export interface IUserTransformOptions {
  value: object
  key: string
  obj: IUserTransformData
}

export interface IUserTransformData {
  level: number
  pivotRoles: {
    role: IUserDataRole
  }[]
}

export interface IUserDataRole {
  id: number
  level: number
  isActive: boolean
  pivotPermissions: {
    bitwise: number
    permission: IUserDataPermission
  }[]
}

export interface IUserDataPermission {
  context: string
  subject: string
  title: string
  sorting: number
  bitwise: number
  isActive: boolean
  isVisible: boolean
}

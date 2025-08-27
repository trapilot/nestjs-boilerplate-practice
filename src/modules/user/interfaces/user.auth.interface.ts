export interface IUserPermission {
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
  [context: string]: IUserPermission
}

export interface IUserRoleTransformOptions {
  key?: boolean
  level?: boolean
  flat?: boolean
}

export type SubjectName = Record<string, string>
export type SubjectObject = Record<string, SubjectName>
export type ContextData = { title: Record<string, string>; subjects: string[] }
export type ContextObject = Record<string, ContextData>
export type PermissionObject = {
  subject: string
  bitwise: number
  title: SubjectName
  context: string
  isActive: boolean
  isVisible: boolean
}

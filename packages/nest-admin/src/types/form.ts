
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'date'
  | 'text'
  | 'object'
  | 'array'

export interface FormField {
  type: FieldType
  required?: boolean
  options?: string[]
  nullable?: boolean
  help?: string
  format?: string
  placeholder?: string
}

export interface FormSchema {
  title?: string
  fields: Record<string, FormField>
}

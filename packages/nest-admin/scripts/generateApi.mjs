import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const INPUT = path.join(ROOT, 'swagger.json')

const raw = fs.readFileSync(INPUT, 'utf-8')
const spec = JSON.parse(raw)
const map = collectModulesFromSwagger()
const srcPath = path.join(ROOT, 'src')

function toSafeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
}

function toCapitalizeCase(name) {
  return name.charAt(0).toLowerCase() + name.slice(1)
}

function toClassName(name) {
  return toCapitalizeCase(toKebabCase(toWord(name).toLowerCase()).split('-').map(s => toPascalCase(s)).join(''))
}

function toPascalCase(name) {
  return name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
}

function toCamelCase(name) {
  const pas = toPascalCase(name)
  return pas.charAt(0).toLowerCase() + pas.slice(1)
}

function toKebabCase(name, glue = '-') {
  const spaced = name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join(glue)
}

function toWord(name) {
  return name.replace(/([A-Z])/g, ' $1').trim()
}


function opToFunctionName(method, url, op) {
  if (op?.operationId) return toSafeName(op.operationId)
  const segs = (url ?? '')
    .split('/')
    .filter(Boolean)
    .map((s) => s.replace(/[{}]/g, ''))
  return toSafeName([method.toLowerCase(), ...segs].join('_'))
}

function detectSecurity(op) {
  if (!op) return false
  return Array.isArray(op.security) && op.security.length > 0
}

function extractTags(op) {
  if (!op || !Array.isArray(op.tags) || op.tags.length === 0) return ['default']
  return op.tags
}

function opToModuleName(op) {
  return extractTags(op)[0].replace(/[^a-zA-Z0-9_]/g, '')
}

function removeDir(dir) {
  if (!fs.existsSync(dir)) return
  fs.rmSync(dir, { recursive: true, force: true })
}

function scanDir(rootPath, canDir) {
  const scanPath = path.join(rootPath, canDir)
  fs.mkdirSync(scanPath, { recursive: true })

  for (const file of fs.readdirSync(scanPath)) {
    if (file.endsWith('.ts')) {
      fs.unlinkSync(path.join(scanPath, file))
    }
  }
  return scanPath
}

function buildPathExpression(rawPath, paramVar = 'params', required = false) {
  const parts = rawPath.split(/(\{[^}]+\})/g).filter(Boolean)
  const expr = parts
    .map((p) => {
      if (p.startsWith('{') && p.endsWith('}')) {
        const key = p.slice(1, -1)
        return `String(${paramVar}${required ? '' : '?'}.${toSafeName(key)})`.replace(' ? .', '?.')
      }
      return JSON.stringify(p)
    })
    .join(' + ')
  return expr
}

function buildQueryParamsSnippet() {
  return `const query = options?.query || {}\nconst search = new URLSearchParams()\nObject.entries(query).forEach(([k, v]) => {\n  if (v === undefined || v === null) return\n  if (Array.isArray(v)) v.forEach((vv) => search.append(k, String(vv)))\n  else search.append(k, String(v))\n})\nconst qs = search.toString()`
}

function resolveSchemaRefName(ref) {
  if (!ref) return null
  const m = String(ref).match(/#\/components\/schemas\/(.+)$/)
  return m ? m[1] : null
}

function getAbilities() {
  const data = {}
  for (const subject of map.keys()) {
    for (const tag of map.get(subject)) {
      const opUser = tag.operation?.jwtAccessToken?.user ?? {}
      const abilities = opUser?.abilities ?? []

      for (const ability of abilities) {
        const exists = ability.subject in data
        if (!exists) {
          data[ability.subject] = []
        }
        for (const action of ability.actions) {
          if (!data[ability.subject].includes(action)) {
            data[ability.subject].push(action)
          }
        }
      }
    }
  }
  return data
}

function getFunctionName(tag) {
  let fn = toSafeName(tag.operation.operationId)
  fn = fn.replace(/^[A-Za-z0-9]+Controller_?/, '')
  if (fn.includes('_')) fn = fn.split('_').slice(-1)[0]

  return toCamelCase(fn)
}

function getResponseType(op) {
  const resp = op?.responses?.['200'] || op?.responses?.['201']
  const schema = resp?.content?.['application/json']?.schema
  if (!schema) return 'any'
  if (schema?.properties?.data?.$ref) {
    const name = resolveSchemaRefName(schema.properties.data.$ref)
    return name ? `_components['schemas']['${name}']` : 'any'
  }
  if (schema?.properties?.data?.items?.$ref) {
    const name = resolveSchemaRefName(schema.properties.data.items.$ref)
    return name ? `_components['schemas']['${name}'][]` : 'any'
  }
  return 'any'
}

function getRequestBodyType(op) {
  const req = op?.requestBody?.content?.['application/json']?.schema
  if (!req) return 'unknown'
  if (req.$ref) {
    const name = resolveSchemaRefName(req.$ref)
    return name ? `_components['schemas']['${name}']` : 'unknown'
  }
  return 'unknown'
}


function isEnumSchema(schema) {
  return schema && Array.isArray(schema.enum) && schema.enum.length > 0
}
function getRefName(refType) {
  return refType.split('/').pop()
}

function buildFormSchema(name, schema) {
  const required = new Set(schema.required || [])
  const properties = schema.properties || {}

  const fields = {}

  Object.entries(properties).forEach(([key, prop]) => {
    const field = {}

    // force require type
    if (!prop.type) prop.type = 'string'

    field.type = prop.type

    // format
    field.format = prop.format ?? prop.type

    // placeholder
    field.placeholder = field.description ?? ''

    // required / nullable
    field.required = required.has(key)
    if (prop.nullable) field.nullable = true

    const refType = prop?.$ref ?? prop?.allOf?.[0]?.$ref
    const refObj = refType ? spec.components?.schemas[getRefName(refType)] : null

    if (refObj !== null) {
      field.type = refObj.type
      if ('format' in refObj) {
        field.format = refObj.format
      }
      if ('properties' in refObj) {
        field.options = Object.keys(refObj.properties)
      }

      if ('enum' in refObj) {
        field.format = 'enum'
        field.options = refObj.enum
      }
    }

    fields[key] = field
  })

  return {
    title: name,
    fields,
  }
}

function generateEnums() {
  const OUT_DIR = path.join(ROOT, 'src', 'types')
  const OUT_FILE = path.join(OUT_DIR, 'enums.ts')

  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith('enums.ts')) {
      fs.unlinkSync(path.join(OUT_DIR, file))
    }
  }

  const schemas = spec.components?.schemas || {}
  const lines = []

  lines.push(`/* AUTO-GENERATED FILE. DO NOT EDIT. */`)
  lines.push('')

  Object.entries(schemas).forEach(([name, schema]) => {
    if (!isEnumSchema(schema)) return
    if (schema.type !== 'string') return

    lines.push(`export type ${name} =`)
    schema.enum.forEach((v) => {
      lines.push(`  | '${v}'`)
    })
    lines.push('')
  })

  if (lines.length === 2) {
    console.log('No enums found')
    return
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(OUT_FILE, lines.join('\n'), 'utf-8')
}

function buildScreenContent(route) {
  const screenPath = path.join(srcPath, 'screens')
  const filePath = path.join(screenPath, `${route.element}.tsx`)

  if (fs.existsSync(filePath)) {
    return
  }

  const struct = buildStructData(route.ability.subject)

  const lines = []
  lines.push(`/* AUTO-GENERATED FILE. DO NOT EDIT. */`)

  if (route.action === 'create') {
    lines.push(`
import formSchema from '../schemas/${struct.moduleName}-request-create-dto.schema'
import { ${struct.serviceName} } from '../services/${struct.serviceFile}'
import { FormPage } from '../components/FormPage'

export default function ${route.element}() {
  return (
    <FormPage
      schema={formSchema}
      onSubmit={${struct.serviceName}.create}
    />
  )
}
`)
  } else if (route.action === 'update') {
    lines.push(`
import formSchema from '../schemas/${struct.moduleName}-request-update-dto.schema'
import { ${struct.serviceName} } from '../services/${struct.serviceFile}'
import { FormPage } from '../components/FormPage'
import { Navigate, useParams } from 'react-router-dom'

export default function ${route.element}() {
   const { id } = useParams<{ id: string }>()

  if (!id) {
     return <Navigate to="/404" replace />
  }

  return (
    <FormPage
      schema={formSchema}
      onLoad={() => ${struct.serviceName}.get({ id })}
      onSubmit={(data) => ${struct.serviceName}.update({ id }, data)}
    />
  )
}
`)
  } else if (route.action == 'read') {
    const onCreate = route.ability.actions.includes('create') ? `${struct.serviceName}.create` : `() => {}`
    const onRead = route.ability.actions.includes('update') ? `(row) => navigate(\`/${toKebabCase(route.ability.subject)}/\${row.id}/view\`)` : `() => {}`
    const onUpdate = route.ability.actions.includes('update') ? `(row) => navigate(\`/${toKebabCase(route.ability.subject)}/\${row.id}/edit\`)` : `() => {}`
    const onDelete = route.ability.actions.includes('delete') ? `${struct.serviceName}.delete` : `() => {}`

    lines.push(`
import { useNavigate } from 'react-router-dom'
import { GenericList } from '../components/GenericList'
import { ${struct.serviceName} } from '../services'

export default function ${route.element}() {
  const navigate = useNavigate()

  return (
    <GenericList
      module="${struct.moduleName}"
      subject="${route.ability.subject}"
      actions={{
        onList: ${struct.serviceName}.list,
        onRead: ${onRead},
        onCreate: ${onCreate},
        onUpdate: ${onUpdate},
        onDelete: ${onDelete},
      }}
    />
  )
}`)
  }

  lines.push('')

  fs.writeFileSync(filePath, lines.join('\n'))
}
function generateRoutes() {
  const OUT_DIR = path.join(ROOT, 'src', 'mixins')
  const OUT_FILE = path.join(OUT_DIR, 'routes.tsx')

  fs.mkdirSync(OUT_DIR, { recursive: true })
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (file.endsWith('routes.tsx')) {
      fs.unlinkSync(path.join(OUT_DIR, file))
    }
  }

  const paths = {}
  const lines = []
  const imports = []
  const spreads= []

  paths['DASHBOARD'] = [
    {
      ability: { subject: 'DASHBOARD', actions: [] },
      action: 'dashboard',
      element: `Dashboard`,
      path: `dashboard`
    }
  ]
  paths['AUTH'] = [
    {
      ability: { subject: 'LOGIN', actions: [] },
      action: 'login',
      element: `Login`,
      path: `login`
    }
  ]

  lines.push(`/* AUTO-GENERATED FILE. DO NOT EDIT. */`)
  lines.push('')


  const abilities = getAbilities()
  for (const subject in abilities) {
    if (subject in paths) continue

    const routes = []
    const actions = []
    for (const action of abilities[subject]) {
      if (actions.includes(action)) continue
      actions.push(action)

      if (!['read', 'update', 'create'].includes(action)) continue

      const elmMain = subject.toLowerCase().split('_').map(s => toPascalCase(s)).join('')
      if (action === 'read') {
        routes.push({
          ability: { subject, actions },
          action,
          element: `${elmMain}List`,
          path: `${toKebabCase(subject)}/list`
        })
        routes.push({
          ability: { subject, actions },
          action,
          element: `${elmMain}View`,
          path: `${toKebabCase(subject)}/:id/view`
        })
      } else if (action === 'update') {
        routes.push({
          ability: { subject, actions },
          action,
          element: `${elmMain}Edit`,
          path: `${toKebabCase(subject)}/:id/edit`
        })
      } else {
        routes.push({
          ability: { subject, actions },
          action,
          element: `${elmMain}${toPascalCase(action)}`,
          path: `${toKebabCase(subject)}/${action}`
        })
      }
    }

    if (routes.length) {
      paths[subject] = routes
    }
  }

  for (const subject in paths) {
    const routes = paths[subject]
    for (const route of routes) {

      buildScreenContent(route)

      imports.push(`import ${route.element} from '../screens/${route.element}'`)
      spreads.push(`{ path: '${route.path}', element: <${route.element} /> }`)
    }
  }


  fs.writeFileSync(OUT_FILE,`${lines.join('\n')}\n${imports.join('\n')}\n
export const MODULE_ROUTES = [
  ${spreads.join(',\n  ')}
]`)
}
function generateSchemas() {
  const writePath = scanDir(srcPath, 'schemas')

  const indexLines = []
  const schemas = spec.components?.schemas || {}
  Object.entries(schemas).forEach(([name, schema]) => {
    if (!name.includes('Request')) return
    if (schema.type !== 'object') return

    const schemaFile = `${toKebabCase(toWord(name))}.schema.ts`
    const form = buildFormSchema(name, schema)
    const code = buildSchemaContent(form)
    const file = path.join(writePath, schemaFile)
    fs.writeFileSync(file, code, 'utf-8')
    indexLines.push(`export * from './${schemaFile.replace(/\.ts$/, '')}'`)
  })
  if (indexLines.length) {
    fs.writeFileSync(path.join(writePath, 'index.ts'), `${indexLines.join('\n')}\n`, 'utf-8')
  }
}
function generateServices() {
  const writePath = scanDir(srcPath, 'services')

  const indexLines = []
  for (const subject of map.keys()) {
    const tags = map.get(subject)
    const struct = buildStructData(subject)

    const code = buildServiceContent(subject, tags)
    const file = path.join(writePath, struct.serviceFile)
    fs.writeFileSync(file, code, 'utf-8')
    indexLines.push(`export * from './${struct.serviceFile.replace(/\.ts$/, '')}'`)
  }
  if (indexLines.length) {
    fs.writeFileSync(path.join(writePath, 'index.ts'), `${indexLines.join('\n')}\n`, 'utf-8')
  }
}

function collectModulesFromSwagger() {
  const map = new Map()
  const tags = {}
  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, operation]) => {
      const name = opToModuleName(operation)
      if (!(name in tags)) {
        tags[name] = []
      }
      tags[name].push({
        name,
        path,
        method,
        operation,
      })
    })
  })

  for (const tag in tags) {
    map.set(tag, tags[tag])
  }

  return map
}

function buildSchemaContent(form) {
  const lines = []
  lines.push(`/* AUTO-GENERATED FILE. DO NOT EDIT. */`)
  lines.push('')
  lines.push(`import { FormSchema } from '../types/form'`)
  lines.push('')
  lines.push(`const schema: FormSchema = ${JSON.stringify(form, null, 2)}`)
  lines.push(``)
  lines.push(`export default schema`)
  lines.push('')
  return lines.join('\n')
}

function buildServiceContent(subject, tags) {
  const lines = []
  lines.push(`/* AUTO-GENERATED FILE. DO NOT EDIT. */`)
  lines.push('')
  lines.push(`import { _privateAxios, _publicAxios } from '../lib/httpClient'`)
  lines.push(`import type { components as _components } from '../types/api'`)
  lines.push('')
  lines.push(`type RequestOptions = { query?: Record<string, unknown>; config?: any }`)
  lines.push('')
  lines.push(`export const ${buildStructData(subject).serviceName} = {`)
  tags.forEach((tag) => {
    const fnName = getFunctionName(tag)
    const usePrivate = detectSecurity(tag.operation)
    const cleanedPath = tag.path.replace(/^\/api\/admin/, '') || '/'
    const pathParamMatches = Array.from(cleanedPath.matchAll(/\{([^}]+)\}/g))
    const pathParams = pathParamMatches.map((m) => toSafeName(m[1]))
    const method = tag.method.toLowerCase()
    const hasBody = ['post', 'put', 'patch'].includes(method)

    const respType = getResponseType(tag.operation)
    const bodyType = hasBody ? getRequestBodyType(tag.operation) : ''

    const paramsSig =
      pathParams.length > 0
        ? `params: { ${pathParams.map((k) => `${k}: string | number`).join('; ')} }`
        : ''
    const bodySig = hasBody ? `body?: ${bodyType}` : ''
    const signatureParts = [paramsSig, bodySig, 'options?: RequestOptions'].filter(Boolean)
    lines.push(`  ${fnName}: async <T = ${respType}>(${signatureParts.join(', ')}): Promise<T> => {`)
    const pathExpr = buildPathExpression(cleanedPath, 'params', pathParams.length > 0)
    lines.push(`    ${buildQueryParamsSnippet()}`)
    lines.push(`    const baseUrl = ${pathExpr}`)
    lines.push(`    const url = qs ? baseUrl + '?' + qs : baseUrl`)
    lines.push(`    const client = ${usePrivate ? '_privateAxios' : '_publicAxios'}`)
    lines.push(`    const config = options?.config || {}`)
    lines.push(`    const data = await client.${method}(url${hasBody ? ', body' : ''}, config)`)
    lines.push(`    return data as T`)
    lines.push('  },')
  })
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

function buildStructData(subject) {
  return {
    objName: toCamelCase(subject.toLowerCase()),
    moduleDir: toKebabCase(subject.toLowerCase()),
    moduleName: toKebabCase(subject.toLowerCase()),
    subjectName: toKebabCase(subject.toLowerCase()).toUpperCase(),
    serviceFile: `${toKebabCase(toWord(subject).toLowerCase())}.service.ts`,
    serviceName: `${toClassName(subject)}Service`,
  }
}

function main() {
  generateEnums()
  generateRoutes()
  generateSchemas()
  generateServices()
}

main()

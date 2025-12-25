import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(process.cwd())
const INPUT = path.join(ROOT, 'swagger.json')
const OUT_DIR = path.join(ROOT, 'src', 'services')

function toSafeName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '_')
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

function toKebabCase(name) {
  const spaced = name
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
  return spaced
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s.toLowerCase())
    .join('-')
}

function opToFunctionName(method, url, op) {
  if (op?.operationId) return toSafeName(op.operationId)
  const segs = url
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

function buildPathExpression(rawPath, paramVar = 'params', required = false) {
  const parts = rawPath.split(/(\{[^}]+\})/g).filter(Boolean)
  const expr = parts
    .map((p) => {
      if (p.startsWith('{') && p.endsWith('}')) {
        const key = p.slice(1, -1)
        return `String(${paramVar}${required ? '' : '?'} .${toSafeName(key)})`.replace(' ? .', '?.')
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

function getResponseType(op) {
  const resp = op?.responses?.['200'] || op?.responses?.['201']
  const schema = resp?.content?.['application/json']?.schema
  if (!schema) return 'any'
  if (schema?.properties?.data?.$ref) {
    const name = resolveSchemaRefName(schema.properties.data.$ref)
    return name ? `schemas['${name}']` : 'any'
  }
  if (schema?.properties?.data?.items?.$ref) {
    const name = resolveSchemaRefName(schema.properties.data.items.$ref)
    return name ? `schemas['${name}'][]` : 'any'
  }
  return 'any'
}

function getRequestBodyType(op) {
  const req = op?.requestBody?.content?.['application/json']?.schema
  if (!req) return 'unknown'
  if (req.$ref) {
    const name = resolveSchemaRefName(req.$ref)
    return name ? `schemas['${name}']` : 'unknown'
  }
  return 'unknown'
}

function generateService(tag, operations) {
  const lines = []
  lines.push(`import { _privateAxios, _publicAxios } from '../lib/httpClient'`)
  lines.push(`import type { components } from '../types/api'`)
  lines.push(`// @ts-ignore`)
  lines.push(`type schemas = components['schemas']`)
  lines.push('')
  lines.push(`type RequestOptions = { query?: Record<string, unknown>; config?: any }`)
  lines.push('')
  const serviceVar = `${toCamelCase(tag)}Service`
  lines.push(`export const ${serviceVar} = {`)
  operations.forEach((op) => {
    let fn = opToFunctionName(op.method, op.path, op.op)
    fn = fn.replace(/^[A-Za-z0-9]+Controller_?/, '')
    if (fn.includes('_')) fn = fn.split('_').slice(-1)[0]
    fn = toCamelCase(fn)
    const usePrivate = detectSecurity(op.op)
    const cleanedPath = op.path.replace(/^\/api\/admin/, '') || '/'
    const pathParamMatches = Array.from(cleanedPath.matchAll(/\{([^}]+)\}/g))
    const pathParams = pathParamMatches.map((m) => toSafeName(m[1]))
    const method = op.method.toLowerCase()
    const hasBody = ['post', 'put', 'patch'].includes(method)

    const respType = getResponseType(op.op)
    const bodyType = hasBody ? getRequestBodyType(op.op) : ''

    const paramsSig =
      pathParams.length > 0
        ? `params: { ${pathParams.map((k) => `${k}: string | number`).join('; ')} }`
        : ''
    const bodySig = hasBody ? `body?: ${bodyType}` : ''
    const signatureParts = [paramsSig, bodySig, 'options?: RequestOptions'].filter(Boolean)
    lines.push(`  ${fn}: async <T = ${respType}>(${signatureParts.join(', ')}): Promise<T> => {`)
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

function main() {
  const raw = fs.readFileSync(INPUT, 'utf-8')
  const spec = JSON.parse(raw)
  const services = new Map()

  const paths = spec.paths || {}
  Object.entries(paths).forEach(([p, methods]) => {
    Object.entries(methods).forEach(([method, op]) => {
      const lower = method.toLowerCase()
      if (!['get', 'post', 'put', 'patch', 'delete'].includes(lower)) return
      const tags = extractTags(op)
      tags.forEach((tag) => {
        const arr = services.get(tag) || []
        arr.push({ path: p, method: lower, op })
        services.set(tag, arr)
      })
    })
  })

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const indexLines = []
  services.forEach((ops, tag) => {
    const code = generateService(tag, ops)
    const fileName = `${toKebabCase(tag)}.service.ts`
    const file = path.join(OUT_DIR, fileName)
    fs.writeFileSync(file, code, 'utf-8')
    console.log('Generated', file)
    indexLines.push(`export * from './${fileName.replace(/\.ts$/, '')}'`)
  })
  fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), `${indexLines.join('\n')}\n`, 'utf-8')
}

main()

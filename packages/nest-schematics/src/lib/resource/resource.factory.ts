import { join, Path, strings } from '@angular-devkit/core'
import { classify } from '@angular-devkit/core/src/utils/strings'
import {
  apply,
  branchAndMerge,
  chain,
  filter,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  template,
  Tree,
  url,
} from '@angular-devkit/schematics'
import * as pluralize from 'pluralize'
import { DeclarationOptions, ModuleDeclarator, ModuleFinder } from '../../index'
import { normalizeToKebabOrSnakeCase } from '../../utils/formatting'
import { Location, NameParser } from '../../utils/name.parser'
import { mergeSourceRoot } from '../../utils/source-root.helpers'
import { ResourceOptions } from './resource.schema'

export function main(options: ResourceOptions): Rule {
  options = transform(options)

  return (tree: Tree, context: SchematicContext) => {
    return branchAndMerge(
      chain([
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        mergeWith(generate(options)),
      ]),
    )(tree, context)
  }
}

function transform(options: ResourceOptions): ResourceOptions {
  const target: ResourceOptions = Object.assign({}, options)
  if (!target.name) {
    throw new SchematicsException('Option (name) is required.')
  }
  target.metadata = 'imports'

  const location: Location = new NameParser().parse(target)
  target.name = normalizeToKebabOrSnakeCase(location.name)
  target.path = normalizeToKebabOrSnakeCase(location.path)
  target.language = target.language !== undefined ? target.language : 'ts'
  if (target.language === 'js') {
    throw new Error(
      'The "resource" schematic does not support JavaScript language (only TypeScript is supported).',
    )
  }
  target.specFileSuffix = normalizeToKebabOrSnakeCase(options.specFileSuffix || 'spec')

  target.path = target.flat ? target.path : join(target.path as Path, target.name)
  target.isSwaggerInstalled = options.isSwaggerInstalled != false

  return target
}

function generate(options: ResourceOptions): Source {
  return (context: SchematicContext) =>
    apply(url(join('./files' as Path, options.language)), [
      filter((path) => {
        if (!options.auth) {
          if (path.endsWith('.dto.ts')) {
            return (
              path.includes('.create.') ||
              path.includes('.update.') ||
              path.includes('.response.dto.')
            )
          }
          return !path.includes('.auth.')
        }
        return true
      }),
      template({
        ...strings,
        ...options,
        lowercased: (name: string) => {
          const classifiedName = classify(name)
          return classifiedName.charAt(0).toLowerCase() + classifiedName.slice(1)
        },
        uppercased: (name: string) => {
          return name
            .replace(/-/g, '_')
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .split(/[\s_]+/)
            .join('_')
            .toUpperCase()
        },
        named: (name: string) => {
          return pluralize
            .singular(name)
            .replace(/-/g, '_')
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .split(/[\s_]+/)
            .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
            .join(' ')
        },
        singular: (name: string) => pluralize.singular(name),
        plural: (name: string) => pluralize.plural(name),
      }),
      move(options.path),
    ])(context)
}

function addDeclarationToModule(options: ResourceOptions): Rule {
  return (tree: Tree) => {
    return tree
    /*
    if (options.skipImport === undefined || options.skipImport) {
      return tree
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path as Path,
    })
    if (!options.module) {
      return tree
    }
    const content = tree.read(options.module).toString()
    const declarator: ModuleDeclarator = new ModuleDeclarator()
    tree.overwrite(
      options.module,
      declarator.declare(content, {
        ...options,
        type: 'module',
      } as DeclarationOptions),
    )
    return tree
    */
  }
}

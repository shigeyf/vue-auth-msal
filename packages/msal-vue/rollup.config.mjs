//
// rollup.config.mjs
//

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pkg from './package.json' assert { type: 'json' }
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import terser from '@rollup/plugin-terser'
import pascalcase from 'pascalcase'
import { VueExternal, VueGlobalsObjects } from './rollup.config.vue.mjs'

// ----------------------------------------------------------------------------
//
// Configurations
//
// Please change baseConfig, buildInputConfigs for your custom Rollup configs.
// ----------------------------------------------------------------------------
const tsConfig = "./tsconfig.json"
const outputDir = "./dist/"
const banner = `/*!\n * ${pkg.name} v${pkg.version}\n * (c) ${new Date().getFullYear()} ${getAuthors(pkg)}\n * @license ${pkg.license}\n */`
const external = ['@azure/msal-common', '@azure/msal-browser', ...VueExternal]
const outputGlobals = Object.assign({'@azure/msal-browser': 'msalBrowser'}, VueGlobalsObjects)
const baseConfig = {
  // core input options
  input: 'src/index.ts',
  external: [],
  plugins: [],
  // output options
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    globals: {},
    // advanced options
    banner: banner,
    sourcemap: false,
    externalLiveBindings: false,
  },
}
const buildInputConfigs = {
  // each file name has the format: `dist/${name}.${suffix}.${ext}`
  // format being a key of this object
  mjs: {
    format: `es`,
    ext: `mjs`,
    variants: [
      {
        name: 'development',
        suffix: '',
        sourcemap: true,
      },
      {
        name: 'production',
        suffix: 'min',
        minify: true
      }
    ],
  },
  cjs: {
    format: `cjs`,
    ext: `cjs`,
    variants: [
      {
        name: 'development',
        suffix: '',
        sourcemap: true,
      },
      {
        name: 'production',
        suffix: 'min',
        minify: true
      }
    ],
  },
  browser: {
    format: `es`,
    ext: `js`,
    suffix: `esm-browser`,
  },
  global: {
    format: `iife`,
    suffix: `global`,
    ext: `js`,
    name: `${pascalcase(pkg.name)}`,
    variants: [
      {
        name: 'development',
        suffix: 'global',
        sourcemap: true,
      },
      {
        name: 'production',
        suffix: 'global.min',
        minify: true
      }
    ],
  },
}
const replacementOption = {
  preventAssignment: true,
  __pkgName__: `${pkg.name}`,
  __pkgVersion__: `${pkg.version}`,
  __pkgBuildDate__: () => JSON.stringify(new Date()),
}

// ----------------------------------------------------------------------------
//
// Local Functions to build rollup configurations
//
// ----------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Export Rollup configurations
 * @returns
 */
function exportRollupConfigs() {
  const rollupConfig = []

  Object.keys(buildInputConfigs).map(buildName => {
    const input = buildInputConfigs[buildName]

    if (Array.isArray(input.variants) && input.variants.length > 0) {
      input.variants.map(variant => {
        rollupConfig.push(buildRollupConfig(baseConfig, input, variant))
      })
    } else {
      rollupConfig.push(buildRollupConfig(baseConfig, input))
    }
  })
  return rollupConfig
}

/**
 * Build Rollup configuration per input
 * @param {*} base
 * @param {*} input
 * @param {*} variant
 * @param {*} plugins
 * @returns
 */
function buildRollupConfig(base, input, variant = {}, plugins = []) {
  const out = Object.assign({}, JSON.parse(JSON.stringify(base))) // Deep obj copy
  const sourceMap = variant.sourcemap || input.sourcemap || out.output.sourcemap || false

  // Update input section
  out.external = external
  out.plugins = [
    typescript({ tsconfig: path.resolve(__dirname, tsConfig), compilerOptions: { sourceMap: sourceMap, composite: false, incremental: false } }),
    resolve(),
    commonjs(),
    ...pluginReplace(true, replacementOption),
    ...pluginMinify(variant.minify || input.minify),
    ...plugins
  ]

  // Update output section
  out.output.file = getOutputFile(variant.suffix || input.suffix, variant.ext || input.ext)
  out.output.format = input.format
  out.output.globals = outputGlobals
  out.output.sourcemap = sourceMap
  if (input.name != undefined) { out.output.name = input.name }

  return out
}

/**
 * Generate output for minify plugin (terser)
 * @param {*} enabled
 * @param {*} terserOptions
 * @returns
 */
function pluginMinify(enabled, terserOptions = {}) {
  if (enabled) {
    return [terser(terserOptions)]
  }
  return []
}

/**
 * Generate output for string replacement plugin
 * @param {*} enabled
 * @param {*} replacement
 * @returns
 */
function pluginReplace(enabled, replacement) {
  if (enabled) {
    return [replace(replacement)]
  }
  return []
}

/**
 * Generate output file name
 * @param {*} suffix
 * @param {*} ext
 * @returns
 */
function getOutputFile(suffix = '', ext = '') {
  const fileBase = pkg.name
  const fileSuffix = suffix ? `.${suffix}` : ''
  const fileExt = ext ? `.${ext}` : '.js'
  return `${outputDir}${fileBase}${fileSuffix}${fileExt}`
}

/**
 * Get authors string from package.json for banner
 * @param {*} pkg
 * @returns
 */
function getAuthors(pkg) {
  const { contributors, author } = pkg
  const authors = new Set()
  if (contributors && contributors)
    contributors.forEach((contributor) => {
      if (contributor.email) {
        authors.add(`${contributor.name} <${contributor.email}>`)
      } else {
        authors.add(`${contributor.name}`)
      }
    })
  if (author) {
    if (author.email) {
      authors.add(`${author.name} <${author.email}>`)
    } else {
      authors.add(`${author.name}`)
    }
  }
  return Array.from(authors).join(', ')
}

// ----------------------------------------------------------------------------
//
// Export Default
//
// ----------------------------------------------------------------------------
export default exportRollupConfigs()
//console.log(exportRollupConfigs())
//console.log(JSON.stringify(exportRollupConfigs()))

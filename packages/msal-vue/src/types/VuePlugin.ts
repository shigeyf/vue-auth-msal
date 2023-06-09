// packages/vue-sample-plugin/src/types/VuePlugin.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { App } from 'vue'

/**
 * @public
 */
export type PluginInstallFunction<Options> = Options extends unknown[]
  ? (app: App, ...options: Options) => any
  : (app: App, options: Options) => any

/**
 * type VuePlugin (this definition is a part of Vue 'Plugin' type)
 * @public
 */
export type VuePlugin<Options = any[]> = { install: PluginInstallFunction<Options> }

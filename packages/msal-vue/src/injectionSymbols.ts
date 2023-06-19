// packages/msal-vue/src/injectionSymbols.ts

import type { InjectionKey } from 'vue'
import type { MsalPlugin } from './MsalPlugin'
import type { UnwrapNestedRefs } from 'vue'
import { InteractionStatus } from '@azure/msal-browser'
import type { AccountInfo } from '@azure/msal-browser'

/**
 * Type: MsalState
 * @internal
 */
export type MsalState = UnwrapNestedRefs<{
  inProgress: InteractionStatus
  accounts: AccountInfo[]
}>

/**
 * @internal
 */
export const msalPluginKey: InjectionKey<MsalPlugin> = Symbol()

/**
 * @internal
 */
export const msalStateKey: InjectionKey<MsalState> = Symbol()

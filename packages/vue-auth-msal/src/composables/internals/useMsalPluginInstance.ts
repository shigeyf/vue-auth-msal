// packages/vue-auth-msal/src/composables/internals/useMsalPluginInstance.ts

import { inject } from 'vue'
import { MsalPlugin } from '../../MsalPlugin'
import { msalPluginKey } from '../../injectionSymbols'

/**
 * Function useMsalPluginInstance
 * @returns
 * @internal
 */
export function useMsalPluginInstance(): MsalPlugin {
  const msalPluginInstance = inject(msalPluginKey)

  if (msalPluginInstance == undefined) {
    throw 'useMsal*() cannot be used without installing vue-auth-msal plugin.'
  }
  return msalPluginInstance
}

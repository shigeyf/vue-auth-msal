// packages/vue-auth-msal/src/composables/useIsAuthenticated.ts

// Plugin Modules
import { useMsal } from './useMsal'
// External Modules
import { type Ref, ref, watch } from 'vue'

/**
 * Function useIsAuthenticated
 * @returns
 * @public
 */
export function useIsAuthenticated(): Ref<boolean> {
  const { accounts } = useMsal()
  const isAuthenticated = ref(accounts.value.length > 0)

  watch(accounts, () => {
    isAuthenticated.value = accounts.value.length > 0
  })

  return isAuthenticated
}

// packages/msal-vue/src/composables/useAccount.ts

// Plugin Modules
import { useMsal } from './useMsal'
// External Modules
import { ref, watch, computed } from 'vue'
import type { AccountInfo } from '@azure/msal-browser'

/**
 * Function useAccount
 * @returns
 * @public
 */
export function useAccount() {
  const { accounts, instance } = useMsal()

  const account = ref<AccountInfo | null>(instance.getActiveAccount())
  const username = computed(() => {
    return account.value ? account.value.username : '(No username)'
  })
  const name = computed(() => {
    return account.value != null && account.value.name != undefined ? account.value.name : '(No name)'
  })
  watch(accounts, () => {
    account.value = instance.getActiveAccount()
  })

  return {
    account: account,
    name: name,
    username: username,
  }
}

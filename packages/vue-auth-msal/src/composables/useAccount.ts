// packages/vue-auth-msal/src/composables/useAccount.ts

// Plugin Modules
import { useMsal } from './useMsal'
import { useMsalPluginInstance } from './internals/useMsalPluginInstance'
// External Modules
import { computed } from 'vue'
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser'
import { InteractionRequiredAuthError, InteractionType } from '@azure/msal-browser'

/**
 * Function useAccount
 * @returns
 * @public
 */
export function useAccount() {
  const plugin = useMsalPluginInstance()
  const interactionType = plugin.options.interactionType
  const loginRequest = plugin.options.loginRequest
  const logger = plugin.getLogger()
  const { account, instance } = useMsal()

  const username = computed(() => {
    return account.value ? account.value.username : '(No username)'
  })
  const name = computed(() => {
    return account.value != null && account.value.name != undefined ? account.value.name : '(No name)'
  })

  const switchAccount = async (newAccount: AccountInfo): Promise<void> => {
    logger.verbose(`useAccount.switchAccount():Called`)
    const request = { ...loginRequest, account: newAccount, prompt: 'none' }
    try {
      logger.verbose(`useAccount.switchAccount():ssoClient triggered with: ${JSON.stringify(request)}`)
      await instance.ssoSilent(request).then((response: AuthenticationResult) => {
        logger.verbose(`useAccount.switchAccount():ssoClient:success response: ${JSON.stringify(response)}`)
        if (response.account != null) {
          instance.setActiveAccount(response.account)
          account.value = instance.getActiveAccount()
          logger.info(`useAccount.switchAccount():ssoClient set ActiveAccount: ${response.account.username}`)
        }
      })
    } catch (e) {
      logger.verbose(`useAccount.switchAccount():ssoClient error: ${JSON.stringify(e)}`)
      if (e instanceof InteractionRequiredAuthError) {
        const interactiveRequest = { ...request, prompt: 'login' }
        if (interactionType === InteractionType.Popup) {
          instance
            .loginPopup(interactiveRequest)
            .then((response: AuthenticationResult) => {
              logger.verbose(`useAccount.switchAccount():loginPopup:success response: ${JSON.stringify(response)}`)
              if (response.account != null) {
                instance.setActiveAccount(response.account)
                account.value = instance.getActiveAccount()
                logger.info(`useAccount.switchAccount():loginPopup set ActiveAccount: ${response.account.username}`)
              }
            })
            .catch((e) => {
              logger.verbose(`useAccount.switchAccount():loginPopup error: ${JSON.stringify(e)}`)
            })
        } else {
          instance.loginRedirect(interactiveRequest).catch((e) => {
            logger.verbose(`useAccount.switchAccount():loginRedirect error: ${JSON.stringify(e)}`)
          })
        }
      }
    }
    logger.verbose(`useAccount.switchAccount():Returned`)
  }

  return {
    account: account,
    name: name,
    username: username,
    switchAccount: switchAccount,
  }
}

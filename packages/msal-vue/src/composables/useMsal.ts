// packages/msal-vue/src/composables/useMsal.ts

// Plugin Modules
import type { MsalContext } from '../types'
// External Modules
import { toRefs, watch } from 'vue'
import { InteractionStatus, InteractionType } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'
import type { EndSessionPopupRequest, EndSessionRequest } from '@azure/msal-browser'
import { useMsalPluginInstance } from './internals/useMsalPluginInstance'
import { useMsalState } from './internals/useMsalState'

/**
 * Function useMsal
 * @returns
 * @public
 */
export function useMsal(): MsalContext {
  const plugin = useMsalPluginInstance()
  const interactionType = plugin.options.interactionType
  const loginRequest = plugin.options.loginRequest
  const logger = plugin.getLogger()
  const msal = plugin.instance
  const msalState = useMsalState()

  // Setup Reactivity for components
  const { inProgress, accounts, activeAccount } = toRefs(msalState)

  // Watch accounts
  watch(accounts, () => {
    logger.verbose(`useMsal.watch[accounts]:Updated account`)
    activeAccount.value = plugin.instance.getActiveAccount()
  })

  // Login
  const login = (loginRequestOverride?: PopupRequest | RedirectRequest | SilentRequest) => {
    if (inProgress.value === InteractionStatus.None) {
      logger.verbose(`useMsal.login():Called`)

      const request = loginRequestOverride != undefined ? loginRequestOverride : loginRequest
      if (interactionType === InteractionType.Popup) {
        logger.verbose(`useMsal.login():loginPopup triggered with ${JSON.stringify(request)}`)
        msal.loginPopup(request)
      } else if (interactionType == InteractionType.Redirect) {
        logger.verbose(`useMsal.login():loginRedirect triggered with ${JSON.stringify(request)}`)
        msal.loginRedirect(request)
      }

      logger.verbose(`useMsal.login():Returned`)
    } else {
      logger.verbose(`useMsal.login():Blocked due to other process is running (state=${inProgress.value})`)
    }
  }

  // Logout
  const logout = (logoutRequestOverrides?: EndSessionPopupRequest | EndSessionRequest) => {
    if (inProgress.value === InteractionStatus.None) {
      logger.verbose(`useMsal.logout():Called`)

      const requestAccount = { account: msal.getActiveAccount() }
      if (interactionType === InteractionType.Popup) {
        const request =
          logoutRequestOverrides != undefined
            ? logoutRequestOverrides
            : {
                mainWindowRedirectUri: '/',
                ...requestAccount,
              }
        logger.verbose(`useMsal.logout():logoutPopup triggered with ${JSON.stringify(request)}`)
        msal.logoutPopup(request)
      } else if (interactionType == InteractionType.Redirect) {
        const request = logoutRequestOverrides != undefined ? logoutRequestOverrides : requestAccount
        logger.verbose(`useMsal.logout():logoutRedirect triggered with ${JSON.stringify(request)}`)
        msal.logoutRedirect(request)
      }

      logger.verbose(`useMsal.logout():Returned`)
    } else {
      logger.verbose(`useMsal.logout():Blocked due to other process is running (state=${inProgress.value})`)
    }
  }

  return {
    instance: msal,
    inProgress: inProgress,
    account: activeAccount,
    accounts: accounts,
    ops: {
      login: login,
      logout: logout,
    },
  }
}

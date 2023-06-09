// packages/msal-vue/src/composables/useMsal.ts

// Plugin Modules
import type { MsalContext } from '../types'
import { MsalPlugin } from '../MsalPlugin'
import { loggerInstance } from '../utils/Logger'
// External Modules
import { getCurrentInstance, toRefs } from 'vue'
import { InteractionStatus, InteractionType } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'

/**
 * Function useMsal
 * @returns
 * @public
 */
export function useMsal(): MsalContext {
  const internalInstance = getCurrentInstance()
  if (!internalInstance) {
    throw 'useMsal() cannot be called outside the setup() function of a component.'
  }

  const { instance, interactionType, loginRequest, inProgress, accounts, tokens } = toRefs<MsalPlugin>(
    internalInstance.appContext.config.globalProperties.$msal,
  )
  /* eslint-disable vue/no-ref-as-operand */
  if (!instance || !inProgress || !accounts) {
    throw 'useMsal() cannot be called without installing msal-vue plugin.'
  }

  // Login
  const login = () => {
    if (inProgress.value === InteractionStatus.None) {
      loggerInstance.debug(`useMsal.login():Called`)

      if (interactionType.value === InteractionType.Popup) {
        instance.value.loginPopup(loginRequest.value)
      } else if (interactionType.value == InteractionType.Redirect) {
        instance.value.loginRedirect(loginRequest.value)
      }

      loggerInstance.debug(`useMsal.login():Returned`)
    } else {
      loggerInstance.debug(`useMsal.login():Blocked due to other process is running (state=${inProgress.value})`)
    }
  }

  // Logout
  const logout = () => {
    if (inProgress.value === InteractionStatus.None) {
      loggerInstance.debug(`useMsal.logout():Called`)

      if (interactionType.value === InteractionType.Popup) {
        instance.value.logoutPopup()
      } else if (interactionType.value == InteractionType.Redirect) {
        instance.value.logoutRedirect()
      }

      loggerInstance.debug(`useMsal.logout():Returned`)
    } else {
      loggerInstance.debug(`useMsal.logout():Blocked due to other process is running (state=${inProgress.value})`)
    }
  }

  // AcquireToken
  const acquireToken = (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => {
    if (inProgress.value === InteractionStatus.None) {
      loggerInstance.debug(`useMsal.acquireToken():Called`)

      const tokenRequest = requestOverride || loginRequest.value
      instance.value
        .acquireTokenSilent(tokenRequest)
        .then((authResult) => {
          if (authResult != null) {
            loggerInstance.info(`useMsal.acquireToken():then:authResult = ${JSON.stringify(authResult)}`)
          } else {
            loggerInstance.info(`useMsal.acquireToken():then:No AuthResult Response`)
          }
        })
        .catch((e) => {
          loggerInstance.info(`useMsal.acquireToken():catch:Error = ${JSON.stringify(e)}`)
        })

      loggerInstance.debug(`useMsal.acquireToken():Returned`)
    } else {
      loggerInstance.debug(`useMsal.acquireToken():Blocked due to other process is running (state=${inProgress.value})`)
    }
  }

  return {
    instance: instance.value,
    interactionType: interactionType.value,
    loginRequest: loginRequest.value,
    inProgress: inProgress,
    accounts: accounts,
    tokens: tokens,
    ops: {
      login: login,
      logout: logout,
      acquireToken: acquireToken,
    },
  }
}

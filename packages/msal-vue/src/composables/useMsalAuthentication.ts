// packages/msal-vue/src/composables/useMsalAuthentication.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// Plugin Modules
import { useMsal } from './useMsal'
import type { MsalAuthResult } from '../types'
import { loggerInstance } from '../utils/Logger'
// External Modules
import { ref } from 'vue'
import { BrowserAuthErrorMessage, InteractionStatus, InteractionType } from '@azure/msal-browser'
import type { AuthenticationResult, AuthError, PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'

/**
 * Function useMsalAuthentication
 * @returns
 * @public
 */
export async function useMsalAuthentication(): Promise<MsalAuthResult> {
  const { instance, interactionType, loginRequest, inProgress } = useMsal()

  const loginType = interactionType
  const isInProgress = ref<boolean>(false)
  const result = ref<AuthenticationResult | null>(null)
  const error = ref<AuthError | null>(null)

  const acquireToken = async (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => {
    loggerInstance.debug(`useMsalAuthentication.acquireToken():Called`)

    if (!isInProgress.value) {
      // Lock
      isInProgress.value = true

      // Process for Handling Redirct
      if (inProgress.value === InteractionStatus.HandleRedirect) {
        loggerInstance.debug(`useMsalAuthentication.acquireToken():Trigger handleRedirectPromise()`)
        try {
          const response = await instance.handleRedirectPromise()
          if (response) {
            loggerInstance.debug(
              `useMsalAuthentication.acquireToken():handleRedirectPromise() got response: ${JSON.stringify(response)}`,
            )
            result.value = response
            error.value = null
          }
        } catch (e) {
          loggerInstance.debug(
            `useMsalAuthentication.acquireToken():handleRedirectPromise() got error: ${JSON.stringify(e)}`,
          )
          result.value = null
          error.value = e as AuthError
        }
        isInProgress.value = false
        return
      }

      // Run AcquireToken
      if (inProgress.value === InteractionStatus.None) {
        const tokenRequest = requestOverride || loginRequest
        loggerInstance.debug(
          `useMsalAuthentication.acquireToken():Trigger acquireTokenSilent() with ${JSON.stringify(tokenRequest)}`,
        )
        try {
          const response = await instance.acquireTokenSilent(tokenRequest)
          result.value = response
          error.value = null
        } catch (e: any) {
          loggerInstance.debug(
            `useMsalAuthentication.acquireToken():Thrown error by acquireTokenSilent(): error = ${JSON.stringify(e)}`,
          )
          // Try Login (Popup or Redirect) when no account error
          if (e['errorCode'] === BrowserAuthErrorMessage.noAccountError.code && instance.getAllAccounts().length == 0) {
            loggerInstance.debug(
              `useMsalAuthentication.acquireToken():Trigger login() with ${JSON.stringify(tokenRequest)}`,
            )
            if (loginType === InteractionType.Popup) {
              await instance
                .loginPopup(tokenRequest)
                .then((response) => {
                  result.value = response
                  error.value = null
                })
                .catch((e) => {
                  result.value = null
                  error.value = e
                })
            } else if (loginType === InteractionType.Redirect) {
              await instance.loginRedirect(tokenRequest).catch((e) => {
                result.value = null
                error.value = e
              })
            }
          }
          // Other error cases
          else {
            result.value = null
            error.value = null
          }
        }
      }
      // Unlock
      isInProgress.value = false
    }

    loggerInstance.debug(`useMsalAuthentication.acquireToken():Returned`)
  }

  await acquireToken()

  return {
    acquireToken: acquireToken,
    result: result,
    error: error,
  }
}

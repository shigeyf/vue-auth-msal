// packages/msal-vue/src/composables/useMsalAuthentication.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// Plugin Modules
import { useMsal } from './useMsal'
import type { MsalAuthResult } from '../types'
import { useMsalPluginInstance } from './internals/useMsalPluginInstance'
// External Modules
import { ref } from 'vue'
import { BrowserAuthErrorMessage, InteractionStatus, InteractionType } from '@azure/msal-browser'
import type { AuthenticationResult, AuthError, PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'

/**
 * Function useMsalAuthentication
 * @returns
 * @public
 */
export function useMsalAuthentication(): MsalAuthResult {
  const plugin = useMsalPluginInstance()
  const interactionType = plugin.options.interactionType
  const loginRequest = plugin.options.loginRequest
  const logger = plugin.getLogger()

  const { instance, inProgress } = useMsal()

  const loginType = interactionType
  const isInProgress = ref<boolean>(false)
  const result = ref<AuthenticationResult | null>(null)
  const error = ref<AuthError | null>(null)

  const acquireToken = async (requestOverride?: PopupRequest | RedirectRequest | SilentRequest): Promise<void> => {
    logger.verbose(`useMsalAuthentication.acquireToken():Called`)

    if (!isInProgress.value) {
      // Lock
      isInProgress.value = true

      // Process for handleRedirectPromise()
      if (inProgress.value === InteractionStatus.HandleRedirect) {
        logger.verbose(`useMsalAuthentication.acquireToken():Trigger handleRedirectPromise()`)
        try {
          const response = await instance.handleRedirectPromise()
          if (response) {
            logger.verbose(
              `useMsalAuthentication.acquireToken():handleRedirectPromise() got response: ${JSON.stringify(response)}`,
            )
            result.value = response
            error.value = null
          }
        } catch (e) {
          logger.verbose(`useMsalAuthentication.acquireToken():handleRedirectPromise() got error: ${JSON.stringify(e)}`)
          result.value = null
          error.value = e as AuthError
        }
        isInProgress.value = false
      }
      // Process for acquireToken()
      else if (inProgress.value === InteractionStatus.None) {
        const tokenRequest = requestOverride || loginRequest
        logger.verbose(
          `useMsalAuthentication.acquireToken():Trigger acquireTokenSilent() with ${JSON.stringify(tokenRequest)}`,
        )
        try {
          const response = await instance.acquireTokenSilent(tokenRequest)
          logger.verbose(`useMsalAuthentication.acquireToken(): got response: ${JSON.stringify(response)}`)
          result.value = response
          error.value = null
        } catch (e: any) {
          logger.verbose(
            `useMsalAuthentication.acquireToken():Thrown error by acquireTokenSilent(): error = ${JSON.stringify(e)}`,
          )
          // Try Login (Popup or Redirect) when no account error
          if (e['errorCode'] === BrowserAuthErrorMessage.noAccountError.code && instance.getAllAccounts().length == 0) {
            logger.verbose(`useMsalAuthentication.acquireToken():Trigger login() with ${JSON.stringify(tokenRequest)}`)
            if (loginType === InteractionType.Popup) {
              await instance
                .loginPopup(tokenRequest)
                .then((response) => {
                  logger.verbose(
                    `useMsalAuthentication.acquireToken():loginPopup() got response: ${JSON.stringify(response)}`,
                  )
                  result.value = response
                  error.value = null
                })
                .catch((e) => {
                  logger.verbose(`useMsalAuthentication.acquireToken():loginPopup() error: ${JSON.stringify(e)}`)
                  result.value = null
                  error.value = e as AuthError
                })
            } else if (loginType === InteractionType.Redirect) {
              await instance.loginRedirect(tokenRequest).catch((e) => {
                logger.verbose(`useMsalAuthentication.acquireToken():loginRedirect() error: ${JSON.stringify(e)}`)
                result.value = null
                error.value = e as AuthError
              })
            }
          }
          // Other error cases
          else {
            result.value = null
            error.value = e as AuthError
          }
        }
      }

      // Unlock
      isInProgress.value = false
    }

    logger.verbose(`useMsalAuthentication.acquireToken():Returned`)
    return
  }

  //await acquireToken()

  return {
    acquireToken: acquireToken,
    result: result,
    error: error,
  }
}

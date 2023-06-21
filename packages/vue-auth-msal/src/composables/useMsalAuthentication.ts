// packages/vue-auth-msal/src/composables/useMsalAuthentication.ts

/* eslint-disable @typescript-eslint/no-explicit-any */

// Plugin Modules
import { useMsal } from './useMsal'
import type { MsalAuthResult } from '../types'
import { useMsalPluginInstance } from './internals/useMsalPluginInstance'
// External Modules
import { ref } from 'vue'
import { InteractionRequiredAuthError, InteractionStatus, InteractionType } from '@azure/msal-browser'
import { BrowserAuthError, BrowserAuthErrorMessage } from '@azure/msal-browser'
import type { AuthenticationResult, AuthError } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'

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

  const loginInteractionType = interactionType
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
        logger.verbose(`useMsalAuthentication.acquireToken():handleRedirectPromise triggered`)
        try {
          const response = await instance.handleRedirectPromise()
          if (response) {
            logger.verbose(
              `useMsalAuthentication.acquireToken():handleRedirectPromise success response: ${JSON.stringify(
                response,
              )}`,
            )
            result.value = response
            error.value = null
          }
        } catch (e) {
          logger.verbose(`useMsalAuthentication.acquireToken():handleRedirectPromise error: ${JSON.stringify(e)}`)
          result.value = null
          error.value = e as AuthError
        }
        isInProgress.value = false
      }
      // Process for acquireToken()
      else if (inProgress.value === InteractionStatus.None) {
        const tokenRequest = requestOverride || loginRequest
        logger.verbose(
          `useMsalAuthentication.acquireToken():acquireTokenSilent triggered with ${JSON.stringify(tokenRequest)}`,
        )
        try {
          const response = await instance.acquireTokenSilent(tokenRequest)
          logger.verbose(
            `useMsalAuthentication.acquireToken():acquireTokenSilent success response: ${JSON.stringify(response)}`,
          )
          result.value = response
          error.value = null
        } catch (e: any) {
          logger.verbose(`useMsalAuthentication.acquireToken():acquireTokenSilent error = ${JSON.stringify(e)}`)
          // Try Login (Popup or Redirect) when no account error
          if (
            e instanceof InteractionRequiredAuthError ||
            (e instanceof BrowserAuthError &&
              (e as BrowserAuthError).errorCode === BrowserAuthErrorMessage.noAccountError.code &&
              instance.getAllAccounts().length == 0)
          ) {
            logger.verbose(
              `useMsalAuthentication.acquireToken():interactive login triggered with ${JSON.stringify(tokenRequest)}`,
            )
            if (loginInteractionType === InteractionType.Popup) {
              await instance
                .loginPopup(tokenRequest)
                .then((response) => {
                  logger.verbose(
                    `useMsalAuthentication.acquireToken():loginPopup success response: ${JSON.stringify(response)}`,
                  )
                  result.value = response
                  error.value = null
                })
                .catch((e) => {
                  result.value = null
                  error.value = e as AuthError
                  if (
                    e instanceof BrowserAuthError &&
                    (e as BrowserAuthError).errorCode === BrowserAuthErrorMessage.userCancelledError.code
                  ) {
                    logger.info(`useMsal.login():loginPopup user_cancelled`)
                  } else {
                    logger.error(`useMsal.login():loginPopup error: ${JSON.stringify(e)}`)
                  }
                })
            } else {
              await instance.loginRedirect(tokenRequest).catch((e) => {
                logger.verbose(`useMsalAuthentication.acquireToken():loginRedirect error: ${JSON.stringify(e)}`)
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

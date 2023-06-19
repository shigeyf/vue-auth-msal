// packages/msal-vue/src/router/RouterGuard.ts

import type { RouteLocationNormalized, Router } from 'vue-router'
import { InteractionType, InteractionStatus, PublicClientApplication } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'
import type { MsalPlugin } from '../MsalPlugin'

/**
 * Function registerRouterGuard
 * @param router
 * @internal
 */
export function registerRouterGuard(router: Router, msal: MsalPlugin) {
  const logger = msal.getLogger()

  // beforeEach
  /* eslint-disable @typescript-eslint/no-unused-vars */
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    logger.verbose(`vue-router:beforeEach():Called`)

    logger.verbose(`vue-router:beforeEach():to = ${JSON.stringify(to)}`)
    logger.verbose(`vue-router:beforeEach():from = ${JSON.stringify(from)}`)

    // Block router navigation (and rendering) before masl initialization finished
    logger.verbose(`vue-router:beforeEach():Awaiting MsalPlugin Init`)
    await msal.waitInitPromise
    logger.verbose(`vue-router:beforeEach():Finished MsalPlugin Init`)

    // true: allow the cuurent navigation.
    // false: cancel the current navigation.
    // If the browser URL was changed (either manually by the user or via back button),
    // it will be reset to that of the from route.
    let result = true

    // Remove auth response hash from app URL when redirecting back to this app from AAD Auth.
    if (msal.getCurrentInteractionStaus() === InteractionStatus.HandleRedirect) {
      // URL components in `hash` property are not encoded, while those in fullPath are encoded;
      // you cannot simply do String.replace() with `hash` property against `fullPath` property.
      const pathWithouHash = to.fullPath.split('#')[0]
      to.fullPath = pathWithouHash
      to.hash = ''
      // `href` property contains `hash` but it's not a valid prop according to type definition
      // You don't likely need to replace `href` for hash removement.
      // To be clarified for future
    }

    // All matched routes (self and its parents) are populated into `matched` property as an array
    // Check if one of the mateched routes has meta:requiresAuth property
    if (to.matched.some((record) => record.meta.requiresAuth)) {
      logger.verbose(`vue-router:beforeEach():Invoke RouterGuard for MsalPlugin because of 'requiresAuth' = true`)

      const request = {
        ...msal.options.loginRequest,
        redirectStartPage: to.fullPath,
      }
      result = await isAuthenticated(msal.instance, msal.options.interactionType, request)
    }

    logger.verbose(`vue-router:beforeEach():Returned`)
    return result
  })
}

/**
 *
 * @param instance
 * @param interactionType
 * @param loginRequest
 * @returns
 */
async function isAuthenticated(
  instance: PublicClientApplication,
  interactionType: InteractionType,
  loginRequest: PopupRequest | RedirectRequest | SilentRequest,
): Promise<boolean> {
  // If your application uses redirects for interaction,
  // handleRedirectPromise must be called and awaited on each page load before determining if a user is signed in or not
  return instance
    .handleRedirectPromise()
    .then(() => {
      // One or more User account is already signed in.
      const accounts = instance.getAllAccounts()
      if (accounts.length > 0) {
        return true
      }
      // User is not signed in and attempting to access protected route. Sign them in.
      if (interactionType === InteractionType.Popup) {
        return instance
          .loginPopup(loginRequest)
          .then(() => true)
          .catch(() => false)
      } else if (interactionType === InteractionType.Redirect) {
        return instance
          .loginRedirect(loginRequest)
          .then(() => true)
          .catch(() => false)
      }
      // Otherwise false: Blocked routing
      return false
    })
    .catch(() => {
      // When error false: Blocked routing
      return false
    })
}

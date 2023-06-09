// packages/msal-vue/src/router/RouterGuard.ts

import { inject } from 'vue'
import type { RouteLocationNormalized, Router } from 'vue-router'
import type { MsalPlugin } from '../plugin'
import { loggerInstance } from '../utils/Logger'
import { InteractionType, PublicClientApplication, type PopupRequest, type RedirectRequest } from '@azure/msal-browser'

/**
 * Function registerRouterGuard
 * @param router
 * @internal
 */
export function registerRouterGuard(router: Router) {
  // beforeEach
  /* eslint-disable @typescript-eslint/no-unused-vars */
  router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    loggerInstance.debug(`vue-router:beforeEach():Called`)

    //loggerInstance.info(`vue-router:beforeEach():to = ${JSON.stringify(to)}`)
    //loggerInstance.info(`vue-router:beforeEach():from = ${JSON.stringify(from)}`)

    // true: allow the cuurent navigation.
    // false: cancel the current navigation.
    // If the browser URL was changed (either manually by the user or via back button),
    // it will be reset to that of the from route.
    let result = true

    if (to.matched.some((record) => record.meta.requiresAuth)) {
      loggerInstance.debug(`vue-router:beforeEach():Invoke RouterGuard because of 'requiresAuth' = true`)
      const msal: MsalPlugin | undefined = inject<MsalPlugin>('$msal')
      if (msal) {
        loggerInstance.info(`vue-router:beforeEach():MSAL Plugin Context = `)
        loggerInstance.info(msal)
        const request = {
          ...msal.loginRequest,
          redirectStartPage: to.fullPath,
        }
        result = await isAuthenticated(msal.instance, msal.interactionType, request)
      } else {
        loggerInstance.info(`vue-router:beforeEach():No MsalPluginContext found then Blocked`)
        result = false
      }
    }

    loggerInstance.debug(`vue-router:beforeEach():Returned`)
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
  loginRequest: PopupRequest | RedirectRequest,
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

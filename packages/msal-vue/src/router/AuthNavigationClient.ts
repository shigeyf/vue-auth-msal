// packages/msal-vue/src/router/AuthNavigationClient.ts

// Plugin Modules
import { loggerInstance } from '../utils/Logger'
// External Modules
import { NavigationClient, type NavigationOptions } from '@azure/msal-browser'
import { type Router } from 'vue-router'

/**
 * Class: AuthNavigationClient
 * Overriding the default NavigationClient which MSAL uses to navigate to other urls in your webpage.
 * @internal
 */
export class AuthNavigationClient extends NavigationClient {
  private router: Router

  constructor(router: Router) {
    super()
    this.router = router
  }

  /**
   * Navigates to other pages within the same web application
   * @param url
   * @param options
   *
   * NOTE: this function will be called only when:
   *   - handleRedirectPromise() at 'Redirect' interaction client
   *     * When returning from the external and When loginRequestUrl is not equal with the page where 'Redirect' was triggered
   *   - logoutPopupAsync() at 'Popup' interaction client
   *     * When logging out via Popup interaction
   */
  async navigateInternal(url: string, options: NavigationOptions) {
    loggerInstance.debug('AuthNavigationClient.ts:navigateInternal():Called')

    loggerInstance.debug(`url = ${url}`)
    loggerInstance.debug(`options = ${JSON.stringify(options)}`)

    const relativePath = url.replace(window.location.origin, '')
    if (options.noHistory) {
      this.router.replace(relativePath)
    } else {
      this.router.push(relativePath)
    }

    loggerInstance.debug('AuthNavigationClient.ts:navigateInternal():Returned always false')
    return false
  }
}

// packages/vue-auth-msal/src/router/AuthNavigationClient.ts

// External Modules
import { NavigationClient, PublicClientApplication, type NavigationOptions } from '@azure/msal-browser'
import { type Router } from 'vue-router'

/**
 * Class: AuthNavigationClient
 * Overriding the default NavigationClient which MSAL uses to navigate to other urls in your webpage.
 * @internal
 */
export class AuthNavigationClient extends NavigationClient {
  private router: Router
  private pca: PublicClientApplication

  constructor(router: Router, pca: PublicClientApplication) {
    super()
    this.router = router
    this.pca = pca
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
    this.pca.getLogger().verbose('AuthNavigationClient:navigateInternal():Called')

    this.pca.getLogger().verbose(`AuthNavigationClient:navigateInternal():url = ${url}`)
    this.pca.getLogger().verbose(`AuthNavigationClient:navigateInternal():options = ${JSON.stringify(options)}`)

    const relativePath = url.replace(window.location.origin, '')
    if (options.noHistory) {
      this.router.replace(relativePath)
    } else {
      this.router.push(relativePath)
    }

    this.pca.getLogger().verbose('AuthNavigationClient:navigateInternal():Returned always false')
    return false
  }
}

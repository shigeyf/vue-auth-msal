// packages/msal-vue/src/plugin.ts

// Plugin Modules
import type { MsalCreateOptions, MsalPluginOptions } from './types'
import type { MsalState } from './injectionSymbols'
import { pkgName, pkgVersion } from './packageMetadata'
import { msalPluginKey, msalStateKey } from './injectionSymbols'
import { registerRouterGuard } from './router/RouterGuard'
import { AuthNavigationClient } from './router/AuthNavigationClient'
import { accountArraysAreEqual } from './utils/utilFuncs'
// External Modules
import type { App, Plugin, UnwrapNestedRefs } from 'vue'
import { reactive } from 'vue'
import { InteractionStatus, InteractionType, PublicClientApplication } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest, WrapperSKU } from '@azure/msal-browser'
import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser'
import { type EventMessage, EventMessageUtils, EventType } from '@azure/msal-browser'
import type { Logger } from '@azure/msal-browser'

/**
 * Function createMsal
 * Creates a Msal plugin instance to be used by the application
 * @public
 */
export function createMsal(msalOptions: MsalCreateOptions): MsalPlugin {
  const msalInstance = new MsalPlugin(msalOptions)
  return msalInstance
}

/**
 * Class MsalPlugin
 * @public
 */
export class MsalPlugin implements Pick<Plugin<MsalPluginOptions>, keyof Plugin<MsalPluginOptions>> {
  // Plugin Contexts
  instance: PublicClientApplication
  options: {
    interactionType: InteractionType
    loginRequest: PopupRequest | RedirectRequest | SilentRequest
  }

  // Private properties
  private _state: UnwrapNestedRefs<MsalState>
  private _logger: Logger
  private _eventCallbacks: { name: string; id: string | null }[]

  // Instance Initialization Awaiter
  private _initResolver: ((value: void | PromiseLike<void>) => void) | null
  waitInitPromise: Promise<void>

  constructor(msalOptions: MsalCreateOptions) {
    // Set default options
    this.options = {
      interactionType: InteractionType.Redirect,
      loginRequest: { scopes: [] },
    }

    this.instance = new PublicClientApplication(msalOptions.configuration)
    if (msalOptions.interactionType != undefined) {
      this.options.interactionType = msalOptions.interactionType
    }
    if (msalOptions.loginRequest != undefined) {
      this.options.loginRequest = msalOptions.loginRequest
    }

    // Initialize values for state
    this._state = reactive({
      inProgress: InteractionStatus.None,
      activeAccount: this.instance.getActiveAccount(),
      accounts: this.instance.getAllAccounts(),
    })

    // Reset Instance Initialization Awaiter
    this._initResolver = null
    this.waitInitPromise = Promise.resolve()

    // Initialize private properties
    this.instance.initializeWrapperLibrary(pkgName as WrapperSKU, pkgVersion)
    this._logger = this.instance.getLogger().clone(pkgName, pkgVersion)
    this._eventCallbacks = []
  }

  getLogger(): Logger {
    return this._logger
  }

  getCurrentInteractionStaus(): InteractionStatus {
    return this._state.inProgress
  }

  // Asynchronous install()
  async install(app: App, options: MsalPluginOptions) {
    this._logger.verbose('MsalPlugin:install():Called')

    //
    // Setup Router Extensions
    //   When vuejs/router is introduced
    //
    if (options.router != undefined) {
      this._logger.verbose('MsalPlugin:install:Initialize Router extension')
      // Set NavigationClient
      const navigationClient = new AuthNavigationClient(options.router, this.instance)
      this.instance.setNavigationClient(navigationClient)
      // Configure Router Guard
      registerRouterGuard(options.router, this)
    }

    //
    // Setup Plugin Contexts
    //
    this._logger.verbose('MsalPlugin:install:Initialize MsalState')
    app.provide(msalPluginKey, this)
    app.provide(msalStateKey, this._state)

    //
    // Configure MSAL App Instance
    //   1. Setup Event hooks
    //   2. Initialize Instance
    //   3. Setup HandleRedirect hook
    //
    this._logger.verbose('MsalPlugin:install:Initialize Event Callback Hooks')
    let id: string | null = null
    // Hooks for Debug
    id = this.instance.addEventCallback((message: EventMessage) => {
      this._logger.verbose(`MsalPlugin:install:EventCallback:[ForDebug]:EventType: ${message.eventType}`)
    })
    this._eventCallbacks.push({ name: 'ForDebug', id: id })

    // Hooks for after LoginSuccess
    id = this.instance.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.LOGIN_SUCCESS) {
        this._logger.verbose(`MsalPlugin:install:EventCallback:[LoginSuccess]:Called`)
        if (message.payload) {
          const result = message.payload as AuthenticationResult
          this._logger.verbose(`MsalPlugin:install:EventCallback:[LoginSuccess]:Payload: ${JSON.stringify(result)}`)
          if (result.account != null) {
            this.setNewActiveAccount(result.account)
          }
        }
        this._logger.verbose(`MsalPlugin:install:EventCallback:[LoginSuccess]:Returned`)
      }
    })
    this._eventCallbacks.push({ name: 'LoginSuccess', id: id })

    // Hooks for Accounts update
    id = this.instance.addEventCallback((message: EventMessage) => {
      switch (message.eventType) {
        case EventType.LOGOUT_END:
        case EventType.ACCOUNT_ADDED:
        case EventType.ACCOUNT_REMOVED:
        case EventType.LOGIN_SUCCESS:
        case EventType.LOGIN_FAILURE:
        case EventType.SSO_SILENT_SUCCESS:
        case EventType.SSO_SILENT_FAILURE:
        case EventType.ACQUIRE_TOKEN_SUCCESS:
        case EventType.ACQUIRE_TOKEN_FAILURE:
        case EventType.HANDLE_REDIRECT_END:
          this._logger.verbose(`MsalPlugin:install:EventCallback:[AccountsUpdate]:Called`)
          this.updateAccounts()
          if (message.eventType === EventType.LOGOUT_END) {
            this.resetAccount()
          }
          this._logger.verbose(`MsalPlugin:install:EventCallback:[AccountsUpdate]:Returned`)
          break
      }
    })
    this._eventCallbacks.push({ name: 'AccountsUpdate', id: id })

    // Hooks for Status Updating
    id = this.instance.addEventCallback((message: EventMessage) => {
      this._logger.verbose(`MsalPlugin:install:EventCallback:[StatusUpdate]:Called`)
      this.updateStatusByMessage(message)
      this._logger.verbose(`MsalPlugin:install:EventCallback:[StatusUpdate]:Returned`)
    })
    this._eventCallbacks.push({ name: 'StatusUpdate', id: id })

    // Hooks for LogOutPopupEnd
    id = this.instance.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.LOGOUT_END && message.interactionType === InteractionType.Popup) {
        this._logger.verbose(`MsalPlugin:install:EventCallback:[LogOutPopupEnd]:Called`)

        const router = options.router
        if (router != undefined) {
          const currentRoute = router.currentRoute.value
          if (currentRoute.meta.requiresAuth) {
            if (currentRoute.meta.popupLogoutFallback != undefined) {
              this._logger.info(
                `MsalPlugin:install:EventCallback:[LogOutPopupEnd]:Route to: ${currentRoute.meta.popupLogoutFallback}`,
              )
              router.push(currentRoute.meta.popupLogoutFallback)
            }
          }
        }

        this._logger.verbose(`MsalPlugin:install:EventCallback:[LogOutPopupEnd]:Returned`)
      }
    })
    this._eventCallbacks.push({ name: 'LogOutPopupEnd', id: id })

    // MSAL Instance Initialization
    this.waitInit()
    await this.instance.initialize().then(() => {
      // Added handleRedirectPromise null Hook for Redirect flow - Reset inProgress state
      this._logger.verbose(`MsalPlugin:install:instance.initialize finished`)
      this.instance
        .handleRedirectPromise()
        .then((response: AuthenticationResult | null) => {
          if (response != null) {
            this._logger.verbose(
              `MsalPlugin:install:handleRedirectPromise success response: ${JSON.stringify(response)}`,
            )
            if (response.account != null) {
              this.setNewActiveAccount(response.account)
            }
          } else {
            this._logger.verbose(`MsalPlugin:install:handleRedirectPromise success response: null`)
            this.resetAccount()
            this.updateAccounts()
          }
        })
        .catch((error) => {
          // Handle errors (either in the library or coming back from the server)
          // Errors should be handled by listening to the LOGIN_FAILURE event
          this._logger.error(`MsalPlugin:install:handleRedirectPromise error: ${error}`)
        })
        .finally(() => {
          this._logger.verbose(`MsalPlugin:install:handleRedirectPromise:finally:Called`)
          // Logics for finally block
          this.resetInProgress()
        })
    })
    this.doneInit()

    this._logger.verbose('MsalPlugin:install():Returned')
  }

  //
  // State handling functions
  //

  private updateStatusByMessage(message: EventMessage) {
    const _status = this._state.inProgress
    const status = EventMessageUtils.getInteractionStatusFromEvent(message, this._state.inProgress)
    if (status !== null) {
      this._state.inProgress = status
      this._logger.info(`MsalPlugin:updateStatusByMessage:Updated from ${_status} to ${status}`)
    }
  }

  private resetInProgress() {
    this._state.inProgress = InteractionStatus.None
    this._logger.info(`MsalPlugin:resetInProgress: inProgress to none`)
  }

  private updateAccounts() {
    const accounts = this.instance.getAllAccounts()
    if (!accountArraysAreEqual(accounts, this._state.accounts)) {
      this._state.accounts = accounts
      this._logger.info(`MsalPlugin:updateAccounts:Updated to: ${JSON.stringify(this._state.accounts)}`)
    }
  }

  private setNewActiveAccount(account: AccountInfo) {
    this.instance.setActiveAccount(account)
    this._state.activeAccount = this.instance.getActiveAccount()
    this._logger.info(`MsalPlugin:setNewActiveAccount: ${account.username}`)
  }

  private resetAccount() {
    const accounts = this.instance.getAllAccounts()
    // No account is stored
    if (accounts.length === 0) {
      this._state.activeAccount = null
      this._logger.info(`MsalPlugin:resetAccount: null`)
    }
    // One or more account are stored
    else if (accounts.length > 0) {
      const account = this._state.accounts[0]
      this.instance.setActiveAccount(account)
      this._state.activeAccount = account
      this._logger.info(`MsalPlugin:resetAccount: ${account.username}`)
    }
  }

  //
  // Initialization control functions
  //

  private waitInit() {
    if (this._initResolver == null) {
      this.waitInitPromise = new Promise((resolve) => (this._initResolver = resolve))
    }
  }
  private doneInit() {
    if (this._initResolver != null) {
      this._initResolver()
      this._initResolver = null
      this.waitInitPromise = Promise.resolve()
    }
  }
}

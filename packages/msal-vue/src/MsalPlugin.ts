// packages/msal-vue/src/plugin.ts

// Plugin Modules
import type { MsalCreateOptions, MsalPluginOptions } from './types'
import type { MsalState } from './injectionSymbols'
import { msalPluginKey, msalStateKey } from './injectionSymbols'
import { registerRouterGuard } from './router/RouterGuard'
import { AuthNavigationClient } from './router/AuthNavigationClient'
import { loggerInstance, Logger, LogLevel } from './utils/Logger'
import { accountArraysAreEqual } from './utils/utilFuncs'
// External Modules
import type { App, UnwrapNestedRefs } from 'vue'
import { reactive } from 'vue'
import { InteractionStatus, InteractionType, PublicClientApplication } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'
import { type AuthenticationResult, type EventMessage, EventMessageUtils, EventType } from '@azure/msal-browser'

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
export class MsalPlugin {
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
    this._logger = loggerInstance
    this._eventCallbacks = []

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
      accounts: this.instance.getAllAccounts(),
    })

    // Reset Instance Initialization Awaiter
    this._initResolver = null
    this.waitInitPromise = Promise.resolve()

    this._logger.setLogLevel(LogLevel.Trace)
  }

  getLogger(): Logger {
    return this._logger
  }

  getCurrentInteractionStaus(): InteractionStatus {
    return this._state.inProgress
  }

  // Asynchronous install()
  async install(app: App, options: MsalPluginOptions) {
    this._logger.debug('MsalPlugin:install():Called')

    //
    // Setup Router Extensions
    //   When vuejs/router is introduced
    //
    if (options.router != undefined) {
      this._logger.debug('MsalPlugin:install:Initialize Router extension')
      // Set NavigationClient
      const navigationClient = new AuthNavigationClient(options.router)
      this.instance.setNavigationClient(navigationClient)
      // Configure Router Guard
      registerRouterGuard(options.router, this)
    }

    //
    // Setup Plugin Contexts
    //
    this._logger.debug('MsalPlugin:install:Initialize MsalState')
    app.provide(msalPluginKey, this)
    app.provide(msalStateKey, this._state)

    //
    // Configure MSAL App Instance
    //   1. Setup Event hooks
    //   2. Initialize Instance
    //   3. Setup HandleRedirect hook
    //
    this._logger.debug('MsalPlugin:install:Initialize Event Callback Hooks')
    let id: string | null = null
    // Hooks for Debug
    id = this.instance.addEventCallback((message: EventMessage) => {
      this._logger.debug(`MsalPlugin:install:EventCallback:[ForDebug]:Event Message:`)
      this._logger.debug(message)
    })
    this._eventCallbacks.push({ name: 'ForDebug', id: id })

    // Hooks for after LoginSuccess
    id = this.instance.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.LOGIN_SUCCESS) {
        this._logger.debug(`MsalPlugin:install:EventCallback:[LoginSuccess]:Called`)

        if (message.payload) {
          const payload = message.payload as AuthenticationResult
          this._logger.info(`MsalPlugin:install:EventCallback:[LoginSuccess]:Payload = ${JSON.stringify(payload)}`)

          // Update accounts
          const account = payload.account
          if (account != null) {
            this.instance.setActiveAccount(account)
            this._logger.info(
              `MsalPlugin:install:EventCallback:[LoginSuccess]:Set Active Account = ${account.username}`,
            )
          }
        }

        this._logger.debug(`MsalPlugin:install:EventCallback:[LoginSuccess]:Returned`)
      }
    })
    this._eventCallbacks.push({ name: 'LoginSuccess', id: id })

    // Hooks for Accounts update
    id = this.instance.addEventCallback((message: EventMessage) => {
      switch (message.eventType) {
        case EventType.ACCOUNT_ADDED:
        case EventType.ACCOUNT_REMOVED:
        case EventType.LOGIN_SUCCESS:
        case EventType.LOGIN_FAILURE:
        case EventType.SSO_SILENT_SUCCESS:
        case EventType.SSO_SILENT_FAILURE:
        case EventType.ACQUIRE_TOKEN_SUCCESS:
        case EventType.ACQUIRE_TOKEN_FAILURE:
        case EventType.HANDLE_REDIRECT_END:
        case EventType.LOGOUT_END:
          {
            this._logger.debug(`MsalPlugin:install:EventCallback:[AccountsUpdate]:Called`)

            const currentAccounts = this.instance.getAllAccounts()
            if (!accountArraysAreEqual(currentAccounts, this._state.accounts)) {
              this._state.accounts = currentAccounts
              this._logger.info(
                `MsalPlugin:install:EventCallback:[AccountsUpdate]:Accounts Updated: ${JSON.stringify(
                  this._state.accounts,
                )}`,
              )
            }

            this._logger.debug(`MsalPlugin:install:EventCallback:[AccountsUpdate]:Returned`)
          }
          break
      }
    })
    this._eventCallbacks.push({ name: 'AccountsUpdate', id: id })

    // Hooks for Status Updating
    id = this.instance.addEventCallback((message: EventMessage) => {
      this._logger.debug(`MsalPlugin:install:EventCallback:[StatusUpdate]:Called`)

      const status = EventMessageUtils.getInteractionStatusFromEvent(message, this._state.inProgress)
      if (status !== null) {
        this._state.inProgress = status
        this._logger.info(
          `MsalPlugin:install:EventCallback:[StatusUpdate]:Status Updated from ${this._state.inProgress} to ${status}`,
        )
      }

      this._logger.debug(`MsalPlugin:install:EventCallback:[StatusUpdate]:Returned`)
    })
    this._eventCallbacks.push({ name: 'StatusUpdate', id: id })

    // Hooks for LogOutPopupEnd
    id = this.instance.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.LOGOUT_END && message.interactionType === InteractionType.Popup) {
        this._logger.debug(`MsalPlugin:install:EventCallback:[LogOutPopupEnd]:Called`)

        const router = options.router
        if (router != undefined) {
          const currentRoute = router.currentRoute.value
          if (currentRoute.meta.requiresAuth) {
            if (currentRoute.meta.popupLogoutFallback != undefined) {
              this._logger.info(
                `MsalPlugin:install:EventCallback:[LogOutPopupEnd]:Route Fallback to ${currentRoute.meta.popupLogoutFallback}`,
              )
              router.push(currentRoute.meta.popupLogoutFallback)
            }
          }
        }

        this._logger.debug(`MsalPlugin:install:EventCallback:[LogOutPopupEnd]:Returned`)
      }
    })
    this._eventCallbacks.push({ name: 'LogOutPopupEnd', id: id })

    // MSAL Instance Initialization
    this.waitInit()
    await this.instance.initialize().then(() => {
      // Added handleRedirectPromise null Hook for Redirect flow - Reset inProgress state
      this._logger.debug(`MsalPlugin:install:instance.initialize() finished`)
      this.instance
        .handleRedirectPromise()
        .catch((error) => {
          // Handle errors (either in the library or coming back from the server)
          // Errors should be handled by listening to the LOGIN_FAILURE event
          this._logger.error(`MsalPlugin:install:handleRedirectPromise:catch:${error}`)
        })
        .finally(() => {
          this._logger.debug(`MsalPlugin:install:handleRedirectPromise:finally:Called`)
          // Logics for finally block
          this._state.inProgress = InteractionStatus.None
        })
    })
    this.doneInit()

    this._logger.debug('MsalPlugin:install():Returned')
  }

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

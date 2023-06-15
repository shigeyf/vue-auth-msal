// packages/msal-vue/src/plugin.ts

// Plugin Modules
import type { MsalCreateOptions, MsalPluginOptions, AuthTokens } from './types'
import { registerRouterGuard } from './router/RouterGuard'
import { AuthNavigationClient } from './router/AuthNavigationClient'
import { loggerInstance, Logger, LogLevel } from './utils/Logger'
import { accountArraysAreEqual, extractTokens } from './utils/utilFuncs'
// External Modules
import type { App } from 'vue'
import { reactive } from 'vue'
import { InteractionStatus, InteractionType, PublicClientApplication } from '@azure/msal-browser'
import type { AccountInfo, PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'
import { type AuthenticationResult, type EventMessage, EventMessageUtils, EventType } from '@azure/msal-browser'

/**
 * Function createMsal
 * Creates a Msal plugin instance to be used by the application
 * @public
 */
export async function createMsal(msalOptions: MsalCreateOptions): Promise<MsalPlugin> {
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
  interactionType: InteractionType
  loginRequest: PopupRequest | RedirectRequest | SilentRequest
  inProgress: InteractionStatus
  accounts: AccountInfo[]
  tokens: AuthTokens

  private _logger: Logger
  private _eventCallbacks: { name: string; id: string | null }[]

  // Instance Initialization Awaiter
  private _initResolver: ((value: void | PromiseLike<void>) => void) | null
  waitInitPromise: Promise<void>

  constructor(msalOptions: MsalCreateOptions) {
    this._logger = loggerInstance
    this._eventCallbacks = []
    this.instance = new PublicClientApplication(msalOptions.configuration)
    this.interactionType = InteractionType.Redirect // default InteractionType
    this.loginRequest = { scopes: [] } // default LoginRequest
    if (msalOptions.interactionType) {
      this.interactionType = msalOptions.interactionType
    }
    if (msalOptions.loginRequest) {
      this.loginRequest = msalOptions.loginRequest
    }
    // Initialized values for state
    this.inProgress = InteractionStatus.None
    this.accounts = []
    this.tokens = {
      idToken: '',
      accessTokens: [],
    }
    // Reset Instance Initialization Awaiter
    this._initResolver = null
    this.waitInitPromise = Promise.resolve()
  }

  setLoglevel(logLevel: LogLevel) {
    this._logger.setLogLevel(logLevel)
  }

  // Asynchronous install()
  async install(app: App, options: MsalPluginOptions) {
    this._logger.debug('MsalPlugin:install():Called')

    // When vuejs/router is introduced
    if (options.router != undefined) {
      // Set NavigationClient
      const navigationClient = new AuthNavigationClient(options.router)
      this.instance.setNavigationClient(navigationClient)
      // Configure Router Guard
      registerRouterGuard(options.router, this)
    }

    this._logger.debug('MsalPlugin:install:Initialize state')
    // Initialize with current MSAL.js accounts
    this.accounts = this.instance.getAllAccounts()
    const state = reactive<MsalPlugin>(this)
    app.config.globalProperties.$msal = state
    app.provide('$msal', state)

    //
    // Configure MSAL.js hooks
    //
    this._logger.debug('MsalPlugin:install:Initialize Event Callback Hooks')
    let id: string | null = null
    // Hooks for Debug
    id = state.instance.addEventCallback((message: EventMessage) => {
      this._logger.debug(`MsalPlugin:install:EventCallback:[ForDebug]:Event Message:`)
      this._logger.debug(message)
    })
    this._eventCallbacks.push({ name: 'ForDebug', id: id })

    // Hooks for after LoginSuccess
    id = state.instance.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.LOGIN_SUCCESS) {
        this._logger.debug(`MsalPlugin:install:EventCallback:[LoginSuccess]:Called`)

        if (message.payload) {
          const payload = message.payload as AuthenticationResult
          this._logger.info(`MsalPlugin:install:EventCallback:[LoginSuccess]:Payload = ${JSON.stringify(payload)}`)

          // Update accounts
          const account = payload.account
          if (account != null) {
            state.instance.setActiveAccount(account)
            this._logger.info(
              `MsalPlugin:install:EventCallback:[LoginSuccess]:Set Active Account = ${account.username}`,
            )
          }
          // Update tokens
          state.tokens = extractTokens(payload) // direct set to 'tokens' for reactivity
          this._logger.info(
            `MsalPlugin:install:EventCallback:[LoginSuccess]:Update tokens = ${JSON.stringify(state.tokens)}`,
          )
        }

        this._logger.debug(`MsalPlugin:install:EventCallback:[LoginSuccess]:Returned`)
      }
    })
    this._eventCallbacks.push({ name: 'LoginSuccess', id: id })

    // Hooks for after AcquireTokenSuccess
    id = state.instance.addEventCallback((message: EventMessage) => {
      if (message.eventType === EventType.ACQUIRE_TOKEN_SUCCESS) {
        this._logger.debug(`MsalPlugin:install:EventCallback:[AcquireTokenSuccess]:Called`)

        if (message.payload) {
          const payload = message.payload as AuthenticationResult
          this._logger.info(
            `MsalPlugin:install:EventCallback:[AcquireTokenSuccess]:Payload = ${JSON.stringify(payload)}`,
          )

          // Update tokens
          state.tokens = extractTokens(payload) // direct set to 'tokens' for reactivity
          this._logger.info(
            `MsalPlugin:install:EventCallback:[AcquireTokenSuccess]:Update tokens = ${JSON.stringify(state.tokens)}`,
          )
        }

        this._logger.debug(`MsalPlugin:install:EventCallback:[AcquireTokenSuccess]:Returned`)
      }
    })
    this._eventCallbacks.push({ name: 'AcquireTokenSuccess', id: id })

    // Hooks for Accounts update
    id = state.instance.addEventCallback((message: EventMessage) => {
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
            if (!accountArraysAreEqual(currentAccounts, state.accounts)) {
              state.accounts = currentAccounts
              this._logger.info(
                `MsalPlugin:install:EventCallback:[AccountsUpdate]:Accounts Updated: ${JSON.stringify(state.accounts)}`,
              )
            }

            this._logger.debug(`MsalPlugin:install:EventCallback:[AccountsUpdate]:Returned`)
          }
          break
      }
    })
    this._eventCallbacks.push({ name: 'AccountsUpdate', id: id })

    // Hooks for Status Updating
    id = state.instance.addEventCallback((message: EventMessage) => {
      this._logger.debug(`MsalPlugin:install:EventCallback:[StatusUpdate]:Called`)

      const status = EventMessageUtils.getInteractionStatusFromEvent(message, state.inProgress)
      if (status !== null) {
        state.inProgress = status
        this._logger.info(
          `MsalPlugin:install:EventCallback:[StatusUpdate]:Status Updated from ${state.inProgress} to ${status}`,
        )
      }

      this._logger.debug(`MsalPlugin:install:EventCallback:[StatusUpdate]:Returned`)
    })
    this._eventCallbacks.push({ name: 'StatusUpdate', id: id })

    // Hooks for LogOutPopupEnd
    id = state.instance.addEventCallback((message: EventMessage) => {
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
      // Added handleRedirectPromise Hook for Redirect flow
      this._logger.debug(`MsalPlugin:install:instance.initialize() finished`)
      state.instance
        .handleRedirectPromise()
        .then((tokenResponse) => {
          this._logger.debug(`MsalPlugin:install:handleRedirectPromise:then:Called`)
          // Reset InteractionStatus after handleRedirectPromise resolved
          state.inProgress = InteractionStatus.None
          // Check if the tokenResponse is null
          // If the tokenResponse !== null, then you are coming back from a successful authentication redirect.
          // If the tokenResponse === null, you are not coming back from an auth redirect.
          if (tokenResponse != null) {
            this._logger.debug(
              `MsalPlugin:install:handleRedirectPromise:then:TokenResponse = ${JSON.stringify(tokenResponse)}`,
            )
          } else {
            this._logger.debug(`MsalPlugin:install:handleRedirectPromise:then:No Token Response`)
          }
        })
        .catch((error) => {
          // Handle errors (either in the library or coming back from the server)
          // Errors should be handled by listening to the LOGIN_FAILURE event
          this._logger.error(`MsalPlugin:install:handleRedirectPromise:catch:${error}`)
        })
        .finally(() => {
          // Logics for finally block
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

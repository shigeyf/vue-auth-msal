// packages/msal-vue/src/types/index.ts

import type { Ref, ComputedRef } from 'vue'
import type { Router } from 'vue-router'
import { InteractionType, InteractionStatus, PublicClientApplication } from '@azure/msal-browser'
import type { Configuration } from '@azure/msal-browser'
import type { AccountInfo, AuthError, AuthenticationResult } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'
import type { EndSessionPopupRequest, EndSessionRequest } from '@azure/msal-browser'

/*
 * Types for Msal Plugin Options
 */

/**
 * Type: MsalCreateOptions
 * @public
 */
export type MsalCreateOptions = {
  configuration: Configuration
  interactionType?: InteractionType
  loginRequest?: PopupRequest | RedirectRequest | SilentRequest
}

/**
 * Type: MsalPluginOptions
 * @public
 */
export type MsalPluginOptions = {
  router?: Router
}

/*
 * Types for Msal Vue Context
 */

/**
 * Type: MsalContext
 * Returned by useMsal()
 * @public
 */
export type MsalContext = {
  instance: PublicClientApplication
  inProgress: Ref<InteractionStatus>
  account: Ref<AccountInfo | null>
  accounts: Ref<AccountInfo[]>
  ops: {
    login: (loginRequestOverride?: PopupRequest | RedirectRequest | SilentRequest) => void
    logout: (logoutRequestOverrides?: EndSessionPopupRequest | EndSessionRequest) => void
  }
}

/**
 * Type: MsalAuthResult
 * Returned by useMsalAuthentication
 * @public
 */
export type MsalAuthResult = {
  acquireToken: (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => Promise<void>
  result: Ref<AuthenticationResult | null>
  error: Ref<AuthError | null>
}

/**
 * Type: MsalAccount
 * Returned by useMsalAccount
 * @public
 */
export type MsalAccount = {
  account: Ref<AccountInfo | null>
  name: ComputedRef<string>
  username: ComputedRef<string>
  switchAccount: (newAccount: AccountInfo) => Promise<void>
}

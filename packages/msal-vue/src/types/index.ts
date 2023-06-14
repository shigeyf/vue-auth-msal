// packages/msal-vue/src/types/index.ts

import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import { InteractionType, InteractionStatus, PublicClientApplication } from '@azure/msal-browser'
import type { Configuration } from '@azure/msal-browser'
import type { AccountInfo, AuthError, AuthenticationResult } from '@azure/msal-browser'
import type { PopupRequest, RedirectRequest, SilentRequest } from '@azure/msal-browser'

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
 * Type: AuthAccessToken
 * @public
 */
export type AuthAccessToken = {
  scopes: string[]
  accessToken: string
}

/**
 * Type: AuthTokens
 * @public
 */
export type AuthTokens = {
  idToken: string
  accessTokens: AuthAccessToken[]
}

/**
 * Type: MsalContext
 * @public
 */
export type MsalContext = {
  instance: PublicClientApplication
  interactionType: InteractionType
  loginRequest: PopupRequest | RedirectRequest | SilentRequest
  inProgress: Ref<InteractionStatus>
  accounts: Ref<AccountInfo[]>
  tokens: Ref<AuthTokens>
  ops: {
    login: () => void
    logout: () => void
    acquireToken: (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => void
  }
}

/**
 * Type: MsalAuthResult
 * @public
 */
export type MsalAuthResult = {
  acquireToken: (requestOverride?: PopupRequest | RedirectRequest | SilentRequest) => Promise<void>
  result: Ref<AuthenticationResult | null>
  error: Ref<AuthError | null>
}

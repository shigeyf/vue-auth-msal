// packages/msal-vue/src/utils/utilFuncs.ts

import type { AccountInfo, AuthenticationResult } from '@azure/msal-browser'
import type { AuthAccessToken, AuthTokens } from '../types'

type AccountIdentifiers = Partial<Pick<AccountInfo, 'homeAccountId' | 'localAccountId' | 'username'>>

/**
 * Helper function to determine whether 2 arrays are equal
 * Used to avoid unnecessary state updates
 * @param arrayA
 * @param arrayB
 * @returns boolean
 * @internal
 */
export function accountArraysAreEqual(arrayA: Array<AccountIdentifiers>, arrayB: Array<AccountIdentifiers>): boolean {
  if (arrayA.length !== arrayB.length) {
    return false
  }

  const comparisonArray = [...arrayB]

  return arrayA.every((elementA) => {
    const elementB = comparisonArray.shift()
    if (!elementA || !elementB) {
      return false
    }

    return (
      elementA.homeAccountId === elementB.homeAccountId &&
      elementA.localAccountId === elementB.localAccountId &&
      elementA.username === elementB.username
    )
  })
}

/**
 * Extract authenticated tokens (idToken and accessToken) from AuthenticationResult
 * @param result
 * @returns AuthTokens
 * @internal
 */
export function extractTokens(result: AuthenticationResult): AuthTokens {
  let idToken = ''
  const accessTokens: AuthAccessToken[] = []

  if (result.idToken != '') {
    idToken = result.idToken
  }
  if (result.accessToken != '') {
    const accessToken: AuthAccessToken = {
      accessToken: result.accessToken,
      scopes: result.scopes,
    }
    accessTokens.push(accessToken)
  }

  return {
    idToken: idToken,
    accessTokens: accessTokens,
  }
}

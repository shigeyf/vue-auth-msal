// samples/vue3-vuetify-msal/src/helpers/claimUtils.ts

import type { TokenClaims } from '@azure/msal-common'

/**
 *
 */
export type MaslTokenClaims = TokenClaims & { [key: string]: unknown }

/**
 *
 */
export type ClaimData = {
  key: string
  value: unknown
  description: string
}
/**
 *
 */
export type ClaimDataList = ClaimData[]

/**
 *
 * @param tokenClaims
 * @returns
 */
export function createClaimsArray(tokenClaims: MaslTokenClaims): ClaimDataList {
  const claims: ClaimDataList = []

  Object.keys(tokenClaims).map((key) => {
    if (typeof tokenClaims[key] !== 'string' && typeof tokenClaims[key] !== 'number') return
    const dict = ClaimDict.find((element) => element.claim == key)
    claims.push({
      key: key,
      value: tokenClaims[key],
      description: dict != undefined ? dict.description : '(No description)',
    })
  })

  return claims
}

/**
 *
 * https://learn.microsoft.com/en-us/azure/active-directory/develop/id-token-claims-reference#payload-claims
 */
const ClaimDict: { claim: string; description: string }[] = [
  {
    claim: 'aud',
    description:
      "Identifies the intended recipient of the token. In <code>id_tokens</code>, the audience is your app's Application ID, assigned to your app in the Azure portal. This value should be validated. The token should be rejected if it fails to match your app's Application ID.",
  },
  {
    claim: 'iss',
    description:
      'Identifies the issuer, or "authorization server" that constructs and returns the token. It also identifies the tenant for which the user was authenticated. If the token was issued by the v2.0 endpoint, the URI ends in <code>/v2.0</code>. The GUID that indicates that the user is a consumer user from a Microsoft account is <code>9188040d-6c67-4c5b-b112-36a304b66dad</code>. Your app should use the GUID portion of the claim to restrict the set of tenants that can sign in to the app, if applicable.',
  },
  {
    claim: 'iat',
    description: 'Indicates when the authentication for the token occurred.',
  },
  {
    claim: 'idp',
    description:
      "Records the identity provider that authenticated the subject of the token. This value is identical to the value of the issuer claim unless the user account isn't in the same tenant as the issuer - guests, for instance. If the claim isn't present, it means that the value of iss can be used instead. For personal accounts being used in an organizational context (for instance, a personal account invited to a tenant), the <code>idp</code> claim may be 'live.com' or an STS URI containing the Microsoft account tenant <code>9188040d-6c67-4c5b-b112-36a304b66dad</code>.",
  },
  {
    claim: 'nbf',
    description: "Identifies the time before which the JWT can't be accepted for processing.",
  },
  {
    claim: 'exp',
    description:
      "Identifies the expiration time on or after which the JWT can't be accepted for processing. In certain circumstances, a resource may reject the token before this time. For example, if a change in authentication is required or a token revocation has been detected.",
  },
  {
    claim: 'c_hash',
    description:
      'The code hash is included in ID tokens only when the ID token is issued with an OAuth 2.0 authorization code. It can be used to validate the authenticity of an authorization code. To understand how to do this validation, see the <a href="https://openid.net/specs/openid-connect-core-1_0.html#HybridIDToken">OpenID Connect specification</a>',
  },
  {
    claim: 'at_hash',
    description:
      'The access token hash is included in ID tokens only when the ID token is issued from the <code>/authorize</code> endpoint with an OAuth 2.0 access token. It can be used to validate the authenticity of an access token. To understand how to do this validation, see the <a href="https://openid.net/specs/openid-connect-core-1_0.html#HybridIDToken">OpenID Connect specification</a>. This claim isn\'t returned on ID tokens from the <code>/token</code> endpoint.',
  },
  {
    claim: 'aio',
    description: "An internal claim that's used to record data for token reuse. Should be ignored.",
  },
  {
    claim: 'preferred_username',
    description:
      "The primary username that represents the user. It could be an email address, phone number, or a generic username without a specified format. Its value is mutable and might change over time. Since it's mutable, this value can't be used to make authorization decisions. It can be used for username hints and in human-readable UI as a username. The <code>profile</code> scope is required to receive this claim. Present only in v2.0 tokens.",
  },
  {
    claim: 'email',
    description:
      'Present by default for guest accounts that have an email address. Your app can request the email claim for managed users (from the same tenant as the resource) using the <code>email</code> <a href="https://learn.microsoft.com/en-us/azure/active-directory/develop/active-directory-optional-claims">optional claim</a>. This value isn\'t guaranteed to be correct and is mutable over time. Never use it for authorization or to save data for a user. If you require an addressable email address in your app, request this data from the user directly by using this claim as a suggestion or prefill in your UX. On the v2.0 endpoint, your app can also request the <code>email</code> OpenID Connect scope - you don\'t need to request both the optional claim and the scope to get the claim.',
  },
  {
    claim: 'name',
    description:
      "The <code>name</code> claim provides a human-readable value that identifies the subject of the token. The value isn't guaranteed to be unique, it can be changed, and should be used only for display purposes. The <code>profile</code> scope is required to receive this claim.",
  },
  {
    claim: 'nonce',
    description:
      "The nonce matches the parameter included in the original authorize request to the IDP. If it doesn't match, your application should reject the token.",
  },
  {
    claim: 'oid',
    description:
      "The immutable identifier for an object, in this case, a user account. This ID uniquely identifies the user across applications - two different applications signing in the same user receives the same value in the <code>oid</code> claim. Microsoft Graph returns this ID as the <code>id</code> property for a user account. Because the <code>oid</code> allows multiple apps to correlate users, the <code>profile</code> scope is required to receive this claim. If a single user exists in multiple tenants, the user contains a different object ID in each tenant - they're considered different accounts, even though the user logs into each account with the same credentials. The <code>oid</code> claim is a GUID and can't be reused.",
  },
  {
    claim: 'roles',
    description: 'The set of roles that were assigned to the user who is logging in.',
  },
  {
    claim: 'rh',
    description: 'An internal claim used to revalidate tokens. Should be ignored.',
  },
  {
    claim: 'sub',
    description:
      "The subject of the information in the token. For example, the user of an app. This value is immutable and can't be reassigned or reused. The subject is a pairwise identifier and is unique to an application ID. If a single user signs into two different apps using two different client IDs, those apps receive two different values for the subject claim. You may or may not want two values depending on your architecture and privacy requirements.",
  },
  {
    claim: 'tid',
    description:
      'Represents the tenant that the user is signing in to. For work and school accounts, the GUID is the immutable tenant ID of the organization that the user is signing in to. For sign-ins to the personal Microsoft account tenant (services like Xbox, Teams for Life, or Outlook), the value is <code>9188040d-6c67-4c5b-b112-36a304b66dad</code>.',
  },
  {
    claim: 'unique_name',
    description:
      "Only present in v1.0 tokens. Provides a human readable value that identifies the subject of the token. This value isn't guaranteed to be unique within a tenant and should be used only for display purposes.",
  },
  {
    claim: 'uti',
    description:
      'Token identifier claim, equivalent to <code>jti</code> in the JWT specification. Unique, per-token identifier that is case-sensitive.',
  },
  {
    claim: 'ver',
    description: 'Indicates the version of the ID token.',
  },
  {
    claim: 'hasGroups',
    description:
      "If present, always true, denoting the user is in at least one group. Used in place of the groups claim for JWTs in implicit grant flows when the full groups claim extends the URI fragment beyond the URL length limits (currently six or more groups). Indicates that the client should use the Microsoft Graph API to determine the user's groups (<code>https://graph.microsoft.com/v1.0/users/{userID}/getMemberObjects</code>).",
  },
  {
    claim: 'groups',
    description:
      "For token requests that aren't limited in length (see <code>hasgroups</code>) but still too large for the token, a link to the full groups list for the user is included. For JWTs as a distributed claim, for SAML as a new claim in place of the <code>groups</code> claim.",
  },
]

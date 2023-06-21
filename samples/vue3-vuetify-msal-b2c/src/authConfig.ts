// samples/vue3-vuetify-msal/src/authConfig.ts

import type { Configuration } from '@azure/msal-browser'
import { InteractionType, LogLevel } from '@azure/msal-browser'

const b2cTenantName = import.meta.env.VITE_B2C_TENANT_NAME || 'YOUR_AAD_B2C_TENANT_NAME_ENTER_HERE'
const b2cClientId = import.meta.env.VITE_B2C_CLIENT_ID || 'YOUR_AAD_B2C_SPA_APP_ID_ENTER_HERE'
const b2cUserFlowSignUpSignIn = import.meta.env.VITE_B2C_USER_FLOW_SUSI || 'YOUR_AAD_B2C_USER_FLOW_SUSI_NAME_ENTER_HERE'
const b2cUserFlowProfileEditing = import.meta.env.VITE_B2C_USER_FLOW_PE || 'YOUR_AAD_B2C_USER_FLOW_PE_NAME_ENTER_HERE'
const b2cUserFlowPasswordReset = import.meta.env.VITE_B2C_USER_FLOW_PR || 'YOUR_AAD_B2C_USER_FLOW_PE_NAME_ENTER_HERE'

export const b2cPolicies = {
  names: {
    signUpSignIn: b2cUserFlowSignUpSignIn,
    editProfile: b2cUserFlowProfileEditing,
    forgotPassword: b2cUserFlowPasswordReset,
  },
  authorities: {
    signUpSignIn: {
      authority: `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/B2C_1_signup_and_signin`,
    },
    editProfile: {
      authority: `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/B2C_1_profile_editing`,
    },
    forgotPassword: {
      authority: `https://${b2cTenantName}.b2clogin.com/${b2cTenantName}.onmicrosoft.com/B2C_1_password_reset`,
    },
  },
  authorityDomain: `${b2cTenantName}.b2clogin.com`,
}

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: b2cClientId,
    authority: b2cPolicies.authorities.signUpSignIn.authority,
    knownAuthorities: [b2cPolicies.authorityDomain],
    redirectUri: '/', // Must be registered as a SPA redirectURI on your app registration
    postLogoutRedirectUri: '/', // Must be registered as a SPA redirectURI on your app registration
  },
  cache: {
    cacheLocation: 'localStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
          default:
            console.log(message)
            return
        }
      },
      logLevel: LogLevel.Verbose,
    },
  },
}

// MSAL Interaction Type
//export const interactionType =  InteractionType.Popup // For Popup-type Login
export const interactionType = InteractionType.Redirect // For Redirect-type Login

// Login Request:
// Scopes for id token or access token to be used at MS Identity Platform endpoints.
export const loginRequest = {
  scopes: [],
  prompt: 'select_account',
}

// Protected Resources Database - Endpoints & Token Request
export const protectedResources = {
  graphMe: {
    endpoint: 'https://graph.microsoft.com/v1.0/me',
    request: { scopes: ['User.Read'] },
  },
}

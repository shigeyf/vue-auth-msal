// samples/vue3-vuetify-msal/src/authConfig.ts

import type { Configuration } from '@azure/msal-browser'
import { InteractionType, LogLevel } from '@azure/msal-browser'

const tenantId = import.meta.env.VITE_TENANT_ID || 'YOUR_AAD_TENANT_ID_ENTER_HERE'
const clientId = import.meta.env.VITE_CLIENT_ID || 'YOUR_AAD_SPA_APP_ID_ENTER_HERE'

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: clientId,
    authority: `https://login.microsoftonline.com/${tenantId}`,
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

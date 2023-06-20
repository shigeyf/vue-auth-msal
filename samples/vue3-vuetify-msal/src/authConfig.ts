// samples/vue3-vuetify-msal/src/authConfig.ts

import type { Configuration } from '@azure/msal-browser'
import { InteractionType, LogLevel } from '@azure/msal-browser'

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: '9504f339-7e58-4367-93b0-1f5b4264b92c',
    authority: 'https://login.microsoftonline.com/223bcdb6-97c3-4545-86f1-1be0b61ca5ee',
    // authority: 'https://login.microsoftonline.com/common',
    // Must be registered as a SPA redirectURI on your app registration
    redirectUri: '/',
    // Must be registered as a SPA redirectURI on your app registration
    postLogoutRedirectUri: '/',
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

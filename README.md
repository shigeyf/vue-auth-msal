# Microsoft Authentication Library plugin for Vue 3.x (vue-auth-msal)

| [Getting Started](https://github.com/shigeyf/vue-auth-msal/tree/main/docs/getting-started.md) | [Azure AD docs](https://aka.ms/aaddevv2) | [Sample apps](https://github.com/shigeyf/vue-auth-msal/tree/main/samples) |
| --------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |

## Table of Contents

1. [About](#about)
1. FAQ (TBD)
1. Changelog (TBD)
1. [Prerequisites](#prerequisites)
1. [Installation](#installation)
1. [Usage](#usage)
1. [Samples](#samples)
1. [Build and Test](#build-and-test)
1. [License](#license)

## About

MSAL library for JavaScript enables client-side JavaScript applications to authenticate users using [Azure AD](https://docs.microsoft.com/azure/active-directory/develop/v2-overview) work and school accounts (AAD), Microsoft personal accounts (MSA) and social identity providers like Facebook, Google, LinkedIn, Microsoft accounts, etc. through [Azure AD B2C](https://docs.microsoft.com/azure/active-directory-b2c/active-directory-b2c-overview#identity-providers) service. It also enables your app to get tokens to access services including your custom services and [Microsoft Cloud](https://www.microsoft.com/enterprise) services such as [Microsoft Graph](https://graph.microsoft.io).

This `vue-auth-msal` vue-plugin package in this repository is an unofficial implementation of MASL authentication plugin for Vue 3.x app, which uses the [`@azure/msal-browser` package](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser) as a peer dependency to enable authentication in Javascript Single-Page Applications without backend servers. This version of the library uses the OAuth 2.0 Authorization Code Flow with PKCE.

> To read more about this protocol, as well as the differences between implicit flow and authorization code flow, see the section in the [@azure/msal-browser README](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/README.md#implicit-flow-vs-authorization-code-flow-with-pkce).

This package is inspired by a sample implementation of [MSAL.js 2.x + Vue 3 + TypeScript application](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/samples/msal-browser-samples/vue3-sample-app) in the Microsoft GitHub repository.

## Prerequisites

- `vue-auth-msal` is meant to be used in [Single-Page Application scenarios](https://docs.microsoft.com/azure/active-directory/develop/scenario-spa-overview).

- Before using `vue-auth-msal` you will need to [register a Single Page Application in Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration) to get a valid `clientId` and other information for configuration, and to register the routes that your app will accept redirect traffic on.

## Installation

The MSAL Vue package is available on NPM.

Please installl `vue-auth-msal` with your favorite package manager to your application:

```shell script
npm install vue-auth-msal
# or with yarn
yarn add vue-auth-msal
# or with pnpm
pnpm install vue-auth-msal
```

## Usage

### Quick Starter

To use this plugin, create a MSAL plugin instance (via `createMsal()`) and
pass it to the app as a plugin (with `use()` Vue function) as below.

This example is to use the plugin with [`vue-router`](https://github.com/vuejs/router).

```ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import routes from './router'
import { createMsal, MsalPlugin } from 'vue-auth-msal'
import type { MsalCreateOptions, MsalPluginOptions } from 'vue-auth-msal'
import { msalConfig, interactionType, loginRequest } from './authConfig' // Your MSAL config file
import App from './App.vue'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})
app.use(router)

const msalOptions: MsalCreateOptions = {
  configuration: msalConfig,
  interactionType: interactionType,
  loginRequest: loginRequest,
}
const msal: MsalPlugin = createMsal(msalOptions)
app.use<MsalPluginOptions>(msal, { router })

app.mount('#app')
```

### Getting Started

For more help getting started with `vue-auth-msal` please see our [Getting Started](https://github.com/shigeyf/vue-auth-msal/tree/main/docs/getting-started.md) doc.

## Samples

Our [samples directory](./samples/) contains several example apps you can spin up to see how this plugin can be used in different scenarios.

- [Create Vue App (TS) Sample with Azure AD](https://github.com/shigeyf/vue-auth-msal/tree/main/samples/vue3-vuetify-msal)
- [Create Vue App (TS) Sample with Azure AD B2C](https://github.com/shigeyf/vue-auth-msal/tree/main/samples/vue3-vuetify-msal-b2c)

## Build and Test

See the [`contributing.md`](https://github.com/shigeyf/vue-auth-msal/tree/main/docs/contributing.md) file for more information.

### Building the package locally

To build the `vue-auth-msal` library, you can do the following:

```bash
// Install dev dependencies from root of repo
npm install
// Change to vue-auth-msal package directory
cd packages/vue-auth-msal/
// To run build only for vue-auth-msal package
npm run build
```

## License

Copyright (c) Shige Fukushima. All rights reserved. Licensed under the Apache 2.0 License.

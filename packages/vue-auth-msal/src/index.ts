// packages/vue-auth-msal/src/index.ts

export { pkgName, pkgVersion, pkgBuildDate } from './packageMetadata'
export type { MsalCreateOptions, MsalPluginOptions } from './types'
export type { MsalContext, MsalAuthResult, MsalAccount } from './types'
export { createMsal, MsalPlugin } from './MsalPlugin'
export { useMsal } from './composables/useMsal'
export { useIsAuthenticated } from './composables/useIsAuthenticated'
export { useMsalAuthentication } from './composables/useMsalAuthentication'
export { useAccount } from './composables/useAccount'

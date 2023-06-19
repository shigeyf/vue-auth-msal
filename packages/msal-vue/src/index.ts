// packages/msal-vue/src/index.ts

export { pkgName, pkgVersion, pkgBuildDate } from './packageMetadata'
export type { MsalCreateOptions, MsalPluginOptions, MsalContext, MsalAuthResult } from './types'
export { createMsal, MsalPlugin } from './MsalPlugin'
export { useMsal } from './composables/useMsal'
export { useIsAuthenticated } from './composables/useIsAuthenticated'
export { useMsalAuthentication } from './composables/useMsalAuthentication'
export { Logger, LogLevel } from './utils/Logger'

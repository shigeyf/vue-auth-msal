// samples/vue3-vuetify-msal/src/main.ts

// Styles
import './assets/scss/main.scss'

// Composables
import App from './App.vue'
import { createApp } from 'vue'
import router from './router'
import vuetify from './plugins/vuetify'
import { installWebFonts } from './plugins/webfonts'
import { createMsal, MsalPlugin } from 'vue-auth-msal'
import type { MsalCreateOptions, MsalPluginOptions } from 'vue-auth-msal'
// MSAL Plugin Configurations
import { msalConfig, interactionType, loginRequest } from './authConfig'

console.log('VueApp[main]:START') // DEBUGLOG

installWebFonts()

const app = createApp(App)
app.use(router)
app.use(vuetify)

const msalOptions: MsalCreateOptions = {
  configuration: msalConfig,
  interactionType: interactionType,
  loginRequest: loginRequest,
}
const msal: MsalPlugin = createMsal(msalOptions)
console.log('VueApp[main]:Instantiated MsalPlugin') // DEBUGLOG
app.use<MsalPluginOptions>(msal, { router })

app.mount('#app')

console.log('VueApp[main]:END') // DEBUGLOG

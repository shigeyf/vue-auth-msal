// samples/vue3-vuetify-msal/src/plugins/webfonts.ts

export async function installWebFonts() {
  console.log('VueApp[webfonts]:Loading web fonts')

  const webFontLoader = await import(/* webpackChunkName: "webfontloader" */ 'webfontloader')
  webFontLoader.load({
    google: {
      families: ['Roboto:100,300,400,500,700,900&display=swap'],
    },
  })

  console.log('VueApp[webfonts]:Loaded web fonts')
}

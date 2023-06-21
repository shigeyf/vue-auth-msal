<!-- samples/vue3-vuetify-msal/src/components/HelloWorld.vue -->

<script setup lang="ts">
  // Scripts
  import { mdiSpeedometer } from '@mdi/js'
  import { mdiAccountGroup } from '@mdi/js'
  defineProps<{ message: string }>()
</script>

<template>
  <v-container fluid fill-height>
    <v-row justify="center" align-content="center">
      <v-col cols="8">
        <div class="text-center">
          <a href="https://vitejs.dev" target="_blank">
            <img class="pa-3" height="144" width="144" src="@/assets/vite.svg" alt="Vite" />
          </a>
          <a href="https://vuejs.org/" target="_blank">
            <img class="pa-3" height="144" width="144" src="@/assets/vue.svg" alt="Vue" />
          </a>
          <a href="https://vuetifyjs.com/" target="_blank">
            <img class="pa-3" height="144" width="144" src="@/assets/vuetify.svg" alt="Vuetify" />
          </a>
        </div>
      </v-col>
    </v-row>

    <div class="d-flex align-center flex-column">
      <div class="text-body-2 font-weight-light mb-n1">Welcome to</div>
      <h1 class="text-h2 font-weight-bold">Vite + Vue + Vuetify</h1>

      <div class="py-3" />

      <h3 class="font-weight-light">{{ message }}</h3>

      <div class="py-3" />

      <div class="font-weight-light">
        Vuetify is a no design skills required UI Library with beautifully handcrafted Vue Components.
      </div>

      <div class="py-3" />

      <p>Edit <code>components/HelloWorld.vue</code> to test HMR</p>
      <p>
        Check out
        <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>, the official Vue + Vite
        starter
      </p>
      <p>
        Install
        <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
        in your IDE for a better DX
      </p>
      <p>Click on the Vite/Vue/Vuetify logos to learn more</p>

      <div class="py-3" />
    </div>

    <v-row class="d-flex align-center justify-center">
      <v-col cols="auto">
        <v-btn
          color="primary"
          href="https://vuetifyjs.com/en/getting-started/installation/"
          min-width="200"
          rel="noopener noreferrer"
          target="_blank"
          size="x-large"
          variant="flat"
        >
          <v-icon :icon="mdiSpeedometer" size="large" start />
          Get Started
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn
          href="https://vuetifyjs.com/components/all/"
          min-width="200"
          rel="noopener noreferrer"
          target="_blank"
          size="x-large"
          variant="outlined"
        >
          <v-icon icon="$vuetify" size="large" start />
          Components
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn
          color="black"
          href="https://community.vuetifyjs.com/"
          min-width="200"
          rel="noopener noreferrer"
          target="_blank"
          size="x-large"
          variant="flat"
        >
          <v-icon :icon="mdiAccountGroup" size="large" start />
          Community
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
  p {
    display: block;
    margin-block-start: 1em;
    margin-block-end: 1em;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
  }
</style>

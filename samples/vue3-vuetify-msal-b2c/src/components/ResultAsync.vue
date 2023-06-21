<!-- samples/vue3-vuetify-msal/src/components/ResultAsync.vue -->

<script lang="ts" setup>
  // Scripts
  import MsalAccount from '@/components/MsalAccount.vue'
  import MsalIdTokenClaims from '@/components/MsalIdTokenClaims.vue'
  import { useMsalAuthentication } from 'vue-auth-msal'

  const { acquireToken } = useMsalAuthentication()
  // Async setup
  await acquireToken()
</script>

<template>
  <v-container>
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
    <MsalAccount />
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
    <MsalIdTokenClaims />
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
  </v-container>
</template>

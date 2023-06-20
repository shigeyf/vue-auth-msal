<!-- samples/vue3-vuetify-msal/src/components/Result.vue -->

<script lang="ts" setup>
  // Scripts
  import MsalAccount from '@/components/MsalAccount.vue'
  import MsalIdTokenClaims from '@/components/MsalIdTokenClaims.vue'
  import MsGraphResult from '@/components/MsGraphResult.vue'
</script>

<template>
  <v-container>
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
    <MsalAccount />
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
    <MsalIdTokenClaims />
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
    <MsGraphResult />
    <v-divider :thickness="8" color="info" class="my-5"></v-divider>
  </v-container>
</template>

<!-- samples/vue3-vuetify-msal/src/views/ProfileNoGuard.vue -->

<script lang="ts" setup>
  // Scripts
  import ResultAsync from '@/components/ResultAsync.vue'
  import Loader from '@/components/Loader.vue'
</script>

<template>
  <Suspense>
    <template #default>
      <v-container fluid>
        <ResultAsync />
      </v-container>
    </template>
    <template #fallback>
      <v-container fluid>
        <Loader />
      </v-container>
    </template>
  </Suspense>
</template>

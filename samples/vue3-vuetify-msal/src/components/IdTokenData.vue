<!-- samples/vue3-vuetify-msal/src/components/IdTokenData.vue -->

<script setup lang="ts">
  // Scripts
  import type { ClaimDataList } from '@/helpers/claimUtils'
  const props = defineProps<{ claims: ClaimDataList }>()
</script>

<template>
  <div>
    <v-toolbar title="Id Token Claims"></v-toolbar>
    <v-container>
      <div>
        See below the claims in your <strong> ID token </strong>. For more information, visit:
        <span>
          <a href="https://docs.microsoft.com/en-us/azure/active-directory/develop/id-tokens#claims-in-an-id-token">
            docs.microsoft.com
          </a>
        </span>
      </div>
    </v-container>
    <v-table fixed-header density="compact" height="500px">
      <thead>
        <tr>
          <th class="text-left">Claim</th>
          <th class="text-left">Value</th>
          <th class="text-left token-description">Description</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in props.claims" :key="item.key">
          <td>{{ item.key }}</td>
          <td>{{ item.value }}</td>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <td><div v-html="item.description"></div></td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
  .v-table > .v-table__wrapper > table > thead > tr > th.token-description {
    min-width: 500px !important;
  }
</style>

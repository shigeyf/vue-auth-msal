<!-- samples/vue3-vuetify-msal/src/components/KvpData.vue -->

<script setup lang="ts">
  // Scripts
  import type { KvpDataList } from '@/helpers/kvpUtils'
  const props = defineProps<{ title: string; data: KvpDataList }>()
</script>

<template>
  <div>
    <v-toolbar :title="props.title"></v-toolbar>
    <v-table fixed-header density="compact">
      <thead>
        <tr>
          <th class="text-left">Key</th>
          <th class="text-left">Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in props.data" :key="item.key">
          <td>{{ item.key }}</td>
          <td>{{ item.value }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

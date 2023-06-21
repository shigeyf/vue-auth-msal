<!-- samples/vue3-vuetify-msal/src/components/MsGraphResult.vue -->

<script lang="ts" setup>
  import KvpData from '@/components/KvpData.vue'
  import { computed, watch } from 'vue'
  import type { ComputedRef } from 'vue'
  import { useMsal } from 'vue-auth-msal'
  import { useGraphWithMsal } from '@/composables/useGraphWithMsal'
  import { convertToKvpDataList, type KvpDataList } from '@/helpers/kvpUtils'
  import { protectedResources } from '@/authConfig'

  const { account } = useMsal()
  const { get, response } = useGraphWithMsal()
  get(protectedResources.graphMe.endpoint, protectedResources.graphMe.request)
  const data: ComputedRef<KvpDataList> = computed(() => {
    return response.value ? convertToKvpDataList(response.value) : []
  })
  watch(account, async () => {
    console.log('VueApp[MsGraphResult]:watch[account]:Triggered') // DEBUG LOG
    if (account != null) {
      get(protectedResources.graphMe.endpoint, protectedResources.graphMe.request)
    }
  })
</script>

<template>
  <KvpData title="Graph API Result" :data="data" />
</template>

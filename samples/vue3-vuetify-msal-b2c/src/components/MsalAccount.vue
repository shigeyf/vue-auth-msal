<!-- samples/vue3-vuetify-msal/src/components/MsalAccount.vue -->

<script lang="ts" setup>
  import KvpData from '@/components/KvpData.vue'
  import { type ComputedRef, computed } from 'vue'
  import { useAccount } from 'msal-vue'
  import { convertToKvpDataList, type KvpDataList } from '@/helpers/kvpUtils'

  const { account } = useAccount()
  const accountKvpData: ComputedRef<KvpDataList> = computed(() => {
    if (account.value) {
      return convertToKvpDataList({
        environment: account.value.environment,
        homeAccountId: account.value.homeAccountId,
        localAccountId: account.value.localAccountId,
        name: account.value.name ? account.value.name : '',
        tenantId: account.value.tenantId,
        username: account.value.username,
      })
    } else {
      return convertToKvpDataList({ $data: 'No account data' })
    }
  })
</script>

<template>
  <KvpData title="Active Account" :data="accountKvpData" />
</template>

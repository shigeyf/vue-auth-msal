<!-- samples/vue3-vuetify-msal/src/components/MsalIdTokenClaims.vue -->

<script lang="ts" setup>
  import IdTokenData from '@/components/IdTokenData.vue'
  import { type ComputedRef, computed } from 'vue'
  import { useAccount } from 'msal-vue'
  import { createClaimsArray, type ClaimDataList } from '@/helpers/claimUtils'

  const { account } = useAccount()
  const claimData: ComputedRef<ClaimDataList> = computed(() => {
    return account.value && account.value.idTokenClaims ? createClaimsArray(account.value.idTokenClaims) : []
  })
</script>

<template>
  <IdTokenData :claims="claimData" />
</template>

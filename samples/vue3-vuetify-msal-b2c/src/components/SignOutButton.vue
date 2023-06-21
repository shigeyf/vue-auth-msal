<!-- samples/vue3-vuetify-msal/src/components/SignOutButton.vue -->

<script lang="ts" setup>
  // Scripts
  import { ref } from 'vue'
  //import { mergeProps } from 'vue'
  import { useAccount, useMsal, useMsalAuthentication } from 'vue-auth-msal'
  import { type AccountInfo } from '@azure/msal-browser'
  import { mdiAccount } from '@mdi/js'
  import { mdiAccountCircle } from '@mdi/js'
  import { mdiAccountPlus } from '@mdi/js'
  import { mdiAccountKeyOutline } from '@mdi/js'
  import { mdiAccountMultiple } from '@mdi/js'
  import { mdiLogout } from '@mdi/js'

  const { ops, accounts } = useMsal()
  const { acquireToken } = useMsalAuthentication()
  const { account, name, username, switchAccount } = useAccount()

  async function acquireTokenWrapper() {
    await acquireToken()
  }

  function handleSwitchAccount(selectedAccount: AccountInfo | null) {
    console.log(`VueApp[SignOutButton]:Selected account = ${JSON.stringify(account)}`)
    const activeAccount = account.value
    if (!selectedAccount || !activeAccount) {
      // Switch to new account (or only when there is no active account)
      console.log(`VueApp[SignOutButton]:Trigger Login with new account`)
      ops.login()
    } else if (selectedAccount && activeAccount && activeAccount.homeAccountId != selectedAccount.homeAccountId) {
      console.log(`VueApp[SignOutButton]:Trigger Switch to selected account`)
      switchAccount(selectedAccount)
    } else {
      console.log(`VueApp[SignOutButton]:Stay with the current active account`)
    }
    isOverlayEnabled.value = false
  }

  const isOverlayEnabled = ref(false)
  function showSwitchAccount() {
    isOverlayEnabled.value = true
  }
  const items = [
    { title: 'Switch account', func: showSwitchAccount, icon: mdiAccountMultiple },
    { title: 'Acquire Token', func: acquireTokenWrapper, icon: mdiAccountKeyOutline },
    { title: 'Sign Out', func: ops.logout, icon: mdiLogout },
  ]
</script>

<template>
  <div class="d-flex justify-space-around">
    <v-menu>
      <template #activator="{ props: menu }">
        <v-avatar color="surface-variant" size="40" v-bind="menu">
          <v-icon :icon="mdiAccount"></v-icon>
        </v-avatar>
        <!--
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltip }">
            <v-avatar color="surface-variant" size="40" v-bind="mergeProps(menu, tooltip)">
              <v-icon :icon="mdiAccount"></v-icon>
            </v-avatar>
          </template>
          <span>Logged in with: {{ accountUserName }}</span>
        </v-tooltip>
        -->
      </template>
      <v-list class="mx-auto" min-width="400px">
        <v-list-item :prepend-icon="mdiAccountCircle" :title="name" :subtitle="username">
          <!-- prepend-avatar="https://hostname/images/image.png" -->
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list :lines="false" density="compact">
        <v-list-item v-for="(item, index) in items" :key="index" :value="item" color="primary">
          <template #prepend>
            <v-icon :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title @click="item.func()">
            {{ item.title }}
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-overlay v-model="isOverlayEnabled" class="justify-center">
      <v-card class="mx-auto" min-width="450px">
        <v-toolbar class="px-5 pr-10" title="Switch active account"></v-toolbar>
        <v-divider></v-divider>
        <v-list>
          <v-list-item
            v-for="(item, i) in accounts"
            :key="i"
            :value="item"
            :active="item.name === account?.name"
            color="primary"
          >
            <template #prepend>
              <v-icon :icon="mdiAccountCircle"></v-icon>
            </template>
            <v-list-item-title @click="handleSwitchAccount(item)">{{ item.name }}</v-list-item-title>
          </v-list-item>
          <v-list-item key="10" value="switch" color="primary">
            <template #prepend>
              <v-icon :icon="mdiAccountPlus"></v-icon>
            </template>
            <v-list-item-title @click="handleSwitchAccount(null)">New account</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-overlay>
  </div>
</template>

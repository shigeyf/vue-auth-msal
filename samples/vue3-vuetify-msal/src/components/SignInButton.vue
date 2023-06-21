<!-- samples/vue3-vuetify-msal/src/components/SignInButton.vue -->

<script lang="ts" setup>
  // scripts
  import { useMsal } from 'vue-auth-msal'
  const { ops } = useMsal()
  const items = [{ title: 'Login', func: ops.login }]
</script>

<template>
  <div class="d-flex justify-space-around">
    <!-- Activator slot -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn class="mx-1" color="primary" variant="flat" v-bind="props"> Sign In </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" :value="index">
          <v-list-item-title @click="item.func()">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <!-- Parent activator -->
    <!--
    <v-btn class="mx-1" color="primary" variant="flat">
      Sign In
      <v-menu activator="parent">
        <v-list>
          <v-list-item v-for="(item, index) in items" :key="index" :value="index">
            <v-list-item-title @click="item.func">{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-btn>
    -->
    <!-- Sibling activator -->
    <!--
    <v-btn id="menu-activator" class="mx-1" color="primary" variant="flat"> Sign In </v-btn>
    <v-menu activator="#menu-activator">
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index" :value="index">
          <v-list-item-title @click="item.func">{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    -->
  </div>
</template>

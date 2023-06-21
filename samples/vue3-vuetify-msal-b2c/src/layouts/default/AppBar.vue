<!-- samples/vue3-vuetify-msal/src/layouts/AppBar.vue -->

<script lang="ts" setup>
  // scripts
  import { ref, computed } from 'vue'
  import { useTheme } from 'vuetify'
  import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js'
  import { useIsAuthenticated } from 'msal-vue'
  import SignInButton from '@/components/SignInButton.vue'
  import SignOutButton from '@/components/SignOutButton.vue'

  const theme = useTheme()
  const darkMode = ref(false)
  const toggleTheme = () => {
    theme.global.name.value = darkMode.value ? 'dark' : 'light'
  }
  const themeIcon = computed(() => {
    return darkMode.value ? mdiWeatherNight : mdiWeatherSunny
  })
  const isAuthenticated = useIsAuthenticated()
</script>

<template>
  <v-app-bar density="comfortable" flat>
    <template #prepend>
      <router-link to="/">
        <v-app-bar-nav-icon icon="$vuetify"></v-app-bar-nav-icon>
      </router-link>
    </template>
    <v-app-bar-title> Vue App Title </v-app-bar-title>
    <v-spacer></v-spacer>
    <template #append>
      <v-container fill-height>
        <v-row class="justify-center align-center">
          <v-col><router-link to="/">Home</router-link></v-col>
          <v-col><router-link to="/profile">Profile</router-link></v-col>
          <v-col><router-link to="/profile-no-guard">ProfileNoGuard</router-link></v-col>
          <v-col cols="auto" class="pr-1"><v-icon :icon="themeIcon"></v-icon></v-col>
          <v-col cols="auto" class="pl-1">
            &nbsp;<v-switch v-model="darkMode" color="primary" @change="toggleTheme()"></v-switch>
          </v-col>
          <v-col cols="auto">
            <SignOutButton v-if="isAuthenticated" />
            <SignInButton v-else />
          </v-col>
        </v-row>
      </v-container>
    </template>
  </v-app-bar>
</template>

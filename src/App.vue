<script setup>
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useTheme } from './composables/useTheme'

const route = useRoute()
useTheme() // initializes theme from localStorage on first load
</script>

<template>
  <NavBar v-if="route.meta.requiresAuth" />
  <RouterView />
</template>

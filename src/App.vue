<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <Live2D />
  </v-app>
</template>

<script setup>
  import Live2D from './Live2D.vue'
</script>

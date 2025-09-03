<template>
  <v-container>
    <h1 class="text-h5 mb-4">➕ 新增餐廳</h1>
    <RestaurantForm @success="goBack" />
  </v-container>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import RestaurantForm from '@/components/RestaurantForm.vue'

  const router = useRouter()
  function goBack () {
    router.push('/restaurants')
  }
</script>

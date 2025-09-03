<!-- 餐廳詳細頁 -->
<template>
  <v-container>
    <v-btn text @click="router.back()">← 回列表</v-btn>

    <v-row>
      <v-col cols="12" md="6">
        <v-img height="300" :src="restaurant.image" />
      </v-col>
      <v-col cols="12" md="6">
        <div class="text-h4 mb-2">{{ restaurant.name }}</div>
        <v-chip class="mb-2">{{ restaurant.category }}</v-chip>
        <StarRating :score="restaurant.average_score" />
        <div class="mt-2"><BusinessHours :hours="restaurant.business_hours" /></div>
        <div class="mt-2">電話：{{ restaurant.phone }}</div>
        <div>地址：{{ restaurant.address }}</div>
        <div>外送：{{ restaurant.delivery ? '提供' : '不提供' }}</div>
      </v-col>
    </v-row>

    <v-btn class="mt-4" color="primary" @click="router.push(`/restaurants/edit/${restaurant._id}`)">
      編輯
    </v-btn>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import BusinessHours from '@/components/BusinessHours.vue'
  import StarRating from '@/components/StarRating.vue'
  import { useRestaurantStore } from '@/stores/restaurantStore'

  const store = useRestaurantStore()
  const route = useRoute()
  const router = useRouter()

  const restaurant = ref({})

  onMounted(async () => {
    const id = route.params.id
    const res = await store.fetchById(id)
    if (res.success) restaurant.value = res.data
    else router.replace('/')
  })
</script>

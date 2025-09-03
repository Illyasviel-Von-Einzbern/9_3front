<template>
  <v-form @submit.prevent="submitOrder">
    <!-- 假設已選好餐廳與品項 -->
    <v-select
      v-model="restaurantId"
      item-title="name"
      item-value="_id"
      :items="restaurants"
      label="選擇餐廳"
    />
    <div v-for="item in menuItems" :key="item._id">
      <v-text-field v-model.number="item.quantity" :label="item.name" min="1" type="number" />
    </div>
    <v-btn :loading="loading" type="submit">送出訂單</v-btn>
    <v-alert v-if="error" type="error">{{ error }}</v-alert>
    <v-alert v-if="orderResult" type="success">訂單建立成功！</v-alert>
  </v-form>
</template>

<script setup>
  import { ref } from 'vue'
  import { useOrderStore } from '../../stores/orderStore'

  const orderStore = useOrderStore()
  const restaurantId = ref('')
  const menuItems = ref([]) // 應由餐廳菜單取得
  const restaurants = ref([]) // 餐廳列表

  const submitOrder = () => {
    const items = menuItems.value
      .filter(i => i.quantity > 0)
      .map(i => ({ menuItemId: i._id, quantity: i.quantity }))
    orderStore.createOrder({ restaurantId: restaurantId.value, items })
  }

  const loading = computed(() => orderStore.loading)
  const error = computed(() => orderStore.error)
  const orderResult = computed(() => orderStore.orderResult)
</script>

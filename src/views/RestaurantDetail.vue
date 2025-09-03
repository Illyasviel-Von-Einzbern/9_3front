<template>
  <div v-if="restaurant">
    <h1>{{ restaurant.name }}</h1>
    <p>{{ restaurant.description }}</p>

    <h2>菜單</h2>
    <div v-for="item in restaurant.menu" :key="item.id">
      <p>{{ item.name }} - ${{ item.price }}</p>
      <input v-model.number="order[item.id]" min="0" type="number">
    </div>

    <button @click="submitOrder">下單</button>
  </div>

  <div v-else>
    <p>載入中...</p>
  </div>
</template>

<script setup>
  import { onMounted, onUnmounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import restaurantApi from '@/services/restaurant.js'

  const route = useRoute()
  const restaurant = ref(null)
  const order = ref({}) // key: 菜單ID, value: 數量

  onMounted(async () => {
    try {
      const id = route.params.id
      const res = await restaurantApi.getDetail(id)

      // 🔍 檢查 API 回傳結構
      console.log('取得餐廳資料:', res)

      // 假設回傳結構是 { success: true, data: {...} }
      restaurant.value = res.data
    } catch (error) {
      console.error('取得餐廳資料失敗:', error)
      alert('載入餐廳資料失敗')
    }
  })

  onUnmounted(() => {
    // 清理狀態（避免回來時造成錯誤）
    restaurant.value = null
    order.value = {}
  })

  function submitOrder () {
    // 取出有選擇數量的商品
    const items = Object.entries(order.value)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty }))

    if (items.length === 0) {
      alert('請選擇至少一項商品數量')
      return
    }

    // TODO: 呼叫點餐 API，送出訂單
    console.log('訂單送出', items)
  }
</script>

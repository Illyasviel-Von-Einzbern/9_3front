<template>
  <v-container>
    <h1 class="text-h5 mb-4">編輯餐廳</h1>

    <RestaurantForm
      v-if="restaurant"
      :restaurant="restaurant"
      @success="fetchRestaurant"
    />

    <v-divider class="my-6" />

    <h2 class="text-h6 mb-2">編輯菜單</h2>
    <MenuEditor v-model="menuItems" />

    <v-btn
      class="mt-4"
      color="primary"
      :loading="saving"
      @click="saveMenus"
    >
      儲存菜單
    </v-btn>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import MenuEditor from '@/components/MenuEditor.vue'
  import RestaurantForm from '@/components/RestaurantForm.vue'
  import restaurantApi from '@/services/restaurant'

  const route = useRoute()
  const restaurant = ref(null)
  const menuItems = ref([])
  const saving = ref(false)

  // 取得餐廳與菜單資料
  async function fetchRestaurant () {
    try {
      const res = await restaurantApi.getId(route.params.id)
      restaurant.value = res.data.data

      const menuRes = await restaurantApi.getMenu(route.params.id)
      menuItems.value = menuRes.data.data
    } catch (error) {
      console.error('取得資料錯誤', error)
      alert('資料載入失敗')
    }
  }

  // 儲存菜單資料
  async function saveMenus () {
    saving.value = true
    try {
      await restaurantApi.createMenu(route.params.id, { menus: menuItems.value })
      alert('菜單儲存成功')
    } catch (error) {
      console.error('儲存菜單失敗', error)
      alert('儲存菜單失敗')
    } finally {
      saving.value = false
    }
  }

  onMounted(fetchRestaurant)
</script>

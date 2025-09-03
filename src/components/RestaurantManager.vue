<!-- RestaurantManager.vue — 餐廳列表管理頁面 -->
<!-- 用途： -->
  <!-- 這是管理餐廳清單的頁面，展示所有餐廳名稱，提供： -->
  <!-- 新增餐廳（只輸入名稱） -->
  <!-- 編輯餐廳名稱 -->
  <!-- 刪除餐廳 -->
  <!-- 功能比較簡單，適合快速管理餐廳列表。 -->
<!-- 主要功能： -->
  <!-- 讀取後端 API 取得所有餐廳資料，顯示在列表 -->
  <!-- 新增餐廳（只輸入名稱） -->
  <!-- 針對列表內餐廳名稱直接編輯 -->
  <!-- 刪除餐廳 -->
<!-- 怎麼用？ -->
  <!-- 直接作為頁面使用，內部有呼叫 API，對接你的後端資料。 -->
<template>
  <div>
    <h1>餐廳管理</h1>

    <!-- 新增餐廳 -->
    <div>
      <input v-model="newRestaurantName" placeholder="輸入新餐廳名稱">
      <button @click="createRestaurant">新增餐廳</button>
    </div>

    <hr>

    <!-- 餐廳列表 -->
    <ul>
      <li v-for="r in restaurants" :key="r._id">
        <div v-if="editId !== r._id">
          {{ r.name }}
          <button @click="startEdit(r)">編輯</button>
          <button @click="deleteRestaurant(r._id)">刪除</button>
        </div>
        <div v-else>
          <input v-model="editName">
          <button @click="updateRestaurant(r._id)">儲存</button>
          <button @click="cancelEdit">取消</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import restaurantApi from '../services/restaurant.js' // 你餐廳的 API 介面

  const restaurants = ref([])
  const newRestaurantName = ref('')

  const editId = ref(null)
  const editName = ref('')

  // 取得所有餐廳
  async function fetchRestaurants () {
    try {
      const res = await restaurantApi.getAll()
      if (res.data.success) {
        restaurants.value = res.data.data
      }
    } catch (error) {
      console.error('取得餐廳錯誤:', error)
    }
  }

  // 新增餐廳
  async function createRestaurant () {
    if (!newRestaurantName.value.trim()) {
      alert('請輸入餐廳名稱')
      return
    }
    try {
      const res = await restaurantApi.create({ name: newRestaurantName.value })
      if (res.data.success) {
        alert('新增成功')
        newRestaurantName.value = ''
        fetchRestaurants()
      }
    } catch (error) {
      console.error('新增餐廳錯誤:', error)
    }
  }

  // 開始編輯
  function startEdit (r) {
    editId.value = r._id
    editName.value = r.name
  }

  // 取消編輯
  function cancelEdit () {
    editId.value = null
    editName.value = ''
  }

  // 儲存編輯
  async function updateRestaurant (id) {
    if (!editName.value.trim()) {
      alert('名稱不能為空')
      return
    }
    try {
      const res = await restaurantApi.update(id, { name: editName.value })
      if (res.data.success) {
        alert('更新成功')
        editId.value = null
        fetchRestaurants()
      }
    } catch (error) {
      console.error('更新餐廳錯誤:', error)
    }
  }

  // 刪除餐廳
  async function deleteRestaurant (id) {
    if (!confirm('確定要刪除嗎？')) return
    try {
      const res = await restaurantApi.delete(id)
      if (res.status === 204 || res.data.success) {
        alert('刪除成功')
        fetchRestaurants()
      }
    } catch (error) {
      console.error('刪除餐廳錯誤:', error)
    }
  }

  onMounted(() => {
    fetchRestaurants()
  })
</script>

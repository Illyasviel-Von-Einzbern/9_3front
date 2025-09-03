<template>
  <div>
    <h1>編輯菜單</h1>
    <MenuEditor v-model="menuItems" />
    <v-btn color="primary" @click="submitMenu">儲存菜單</v-btn>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import MenuEditor from '@/components/MenuEditor.vue'
  import restaurantApi from '@/services/restaurant'

  const route = useRoute()
  const menuItems = ref([])

  onMounted(async () => {
    const res = await restaurantApi.getMenu(route.params.id)
    menuItems.value = res.data.data
  })

  async function submitMenu () {
    const res = await restaurantApi.createMenu(route.params.id, { menus: menuItems.value })
    alert('儲存成功')
  }
</script>

<!-- 用在 /restaurants/:id/menu 管理頁面： -->

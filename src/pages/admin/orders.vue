<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">訂單管理</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-data-table :headers="headers" :items="orders">
          <template #[`item.items`]="{ value }">
            <ul>
              <li v-for="item in value" :key="item.menuItemId">
                {{ item.name }} x {{ item.quantity }}（${{ item.price }}）
              </li>
            </ul>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import orderService from '@/services/order'

  const createSnackbar = useSnackbar()
  const orders = ref([])

  const headers = [
    { title: '訂單編號', key: '_id' },
    { title: '日期', key: 'createdAt', value: item => new Date(item.createdAt).toLocaleString('zh-TW') },
    { title: '訂購人', key: 'user.account' },
    { title: '餐廳', key: 'restaurant.name' },
    { title: '餐點內容', key: 'items', sortable: false },
    { title: '總金額', key: 'totalPrice' },
    { title: '狀態', key: 'status' },
  ]

  const getOrders = async () => {
    try {
      const { data } = await orderService.getAll()
      orders.value = data.data
    } catch {
      createSnackbar({ text: '無法載入訂單資料', snackbarProps: { color: 'red' } })
    }
  }
  getOrders()
</script>

<route lang="yaml">
  meta:
    layout: 'admin'
    title: '訂單管理'
    login: 'login-only'
    admin: true
</route>

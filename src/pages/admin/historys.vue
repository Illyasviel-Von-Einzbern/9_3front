<template>
  <v-container>
    <h1 class="text-center">歷史訂單管理</h1>
    <v-row>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="date"
          clearable
          label="選擇日期"
          :max="today"
          type="date"
        />
      </v-col>
    </v-row>
    <v-card v-if="orders.length > 0">
      <v-card-title>
        <v-tabs v-model="groupMode" grow>
          <v-tab value="user">依訂購人分群</v-tab>
          <v-tab value="menu">依餐點分群</v-tab>
        </v-tabs>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-expansion-panels>
          <template v-if="groupMode === 'user'">
            <v-expansion-panel
              v-for="user in userList"
              :key="user"
            >
              <v-expansion-panel-title>
                {{ user }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-data-table
                  class="mb-4"
                  :headers="headers"
                  hide-default-footer
                  :items="ordersByUser[user]"
                >
                  <template #[`item.createdAt`]="{ item }">
                    {{ new Date(item.createdAt).toLocaleTimeString('zh-TW') }}
                  </template>
                  <template #[`item.items`]="{ item }">
                    <ul class="pl-0" style="list-style-type: none;">
                      <li v-for="orderItem in item.items" :key="orderItem.menuItemId">
                        {{ orderItem.name }} x {{ orderItem.quantity }}
                      </li>
                    </ul>
                  </template>
                  <template #[`item.totalPrice`]="{ item }">
                    ${{ item.totalPrice }}
                  </template>
                </v-data-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>
          <template v-else>
            <v-expansion-panel
              v-for="menuName in menuList"
              :key="menuName"
            >
              <v-expansion-panel-title>
                {{ menuName }}（總數量：{{ menuTotalQuantity(menuName) }}）
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-data-table
                  class="mb-4"
                  :headers="menuHeaders"
                  hide-default-footer
                  :items="ordersByMenu[menuName]"
                >
                  <template #[`item.createdAt`]="{ item }">
                    {{ new Date(item.createdAt).toLocaleTimeString('zh-TW') }}
                  </template>
                  <template #[`item.quantity`]="{ item }">
                    {{ item.quantity }}
                  </template>
                </v-data-table>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
    <v-alert v-else class="mt-4" type="info">查無訂單紀錄</v-alert>
  </v-container>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import orderService from '@/services/order.js'

  const date = ref('')
  const today = new Date().toISOString().slice(0, 10)
  const orders = ref([])
  const loading = ref(false)
  const groupMode = ref('user')

  const headers = [
    { title: '餐廳', key: 'restaurant.name' },
    { title: '餐點內容', key: 'items' },
    { title: '訂購人', key: 'user.account' },
    { title: '總價', key: 'totalPrice' },
    { title: '時間', key: 'createdAt' },
  ]

  const menuHeaders = [
    { title: '訂購人', key: 'user', sortable: true },
    { title: '數量', key: 'quantity', sortable: true },
    { title: '時間', key: 'createdAt', sortable: true },
  ]

  const loadHistory = async () => {
    if (!date.value) {
      orders.value = []
      return
    }
    loading.value = true
    try {
      const { data } = await orderService.getAll()
      orders.value = data.data.filter(order => {
        const d = new Date(order.createdAt)
        const selected = new Date(date.value)
        return (
          d.getFullYear() === selected.getFullYear()
          && d.getMonth() === selected.getMonth()
          && d.getDate() === selected.getDate()
        )
      })
    } finally {
      loading.value = false
    }
  }
  watch(date, loadHistory)

  const userList = computed(() => {
    const users = new Set(orders.value.map(order => order.user.account))
    return Array.from(users)
  })
  const ordersByUser = computed(() => {
    const result = {}
    for (const user of userList.value) {
      result[user] = orders.value.filter(order => order.user.account === user)
    }
    return result
  })

  const menuList = computed(() => {
    const names = new Set()
    for (const order of orders.value) {
      for (const item of order.items) {
        names.add(item.name)
      }
    }
    return Array.from(names)
  })
  const ordersByMenu = computed(() => {
    const result = {}
    for (const name of menuList.value) {
      result[name] = []
    }
    for (const order of orders.value) {
      for (const item of order.items) {
        if (result[item.name]) {
          result[item.name].push({
            user: order.user.account,
            quantity: item.quantity,
            createdAt: order.createdAt,
          })
        }
      }
    }
    return result
  })
  const menuTotalQuantity = menuName => {
    return ordersByMenu.value[menuName]?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }
</script>

<route lang="yaml">
meta:
  layout: admin
  title: 歷史訂單管理
  login: login-only
  admin: true
</route>

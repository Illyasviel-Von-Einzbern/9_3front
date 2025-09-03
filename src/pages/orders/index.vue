<template>
  <v-container>
    <v-row>
      <v-col cols="10">
        <h1 class="text-h4 mb-4">今日訂餐分群總覽</h1>
      </v-col>
      <v-col cols="2">
        <v-btn color="primary" @click="$router.push('/orders/history')">
          查詢歷史訂單
        </v-btn>
      </v-col>
    </v-row>

    <v-card>
      <v-card-title>
        <v-tabs v-model="groupMode" grow>
          <v-tab value="user">依訂購人分群</v-tab>
          <v-tab value="menu">依餐點分群</v-tab>
          <v-tab value="category">依種類分群</v-tab>
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
                  :loading="loading"
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
          <template v-else-if="groupMode === 'menu'">
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
                  :loading="loading"
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
          <template v-else-if="groupMode === 'category'">
            <v-expansion-panel
              v-for="category in categoryList"
              :key="category"
            >
              <v-expansion-panel-title>
                {{ category }}
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-data-table
                  class="mb-4"
                  :headers="headers"
                  hide-default-footer
                  :items="ordersByCategory[category]"
                  :loading="loading"
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
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-container>
</template>
<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import orderService from '@/services/order.js'

  const createSnackbar = useSnackbar()

  const loading = ref(true)
  const orders = ref([])

  const groupMode = ref('user') // 'user' or 'menu' or 'category'

  // Filters
  const selectedUser = ref(null)
  const selectedCategory = ref(null)

  const headers = [
    { title: '種類', key: 'restaurant.category', sortable: true },
    { title: '餐廳', key: 'restaurant.name', sortable: true },
    { title: '餐點內容', key: 'items', sortable: false, align: 'start' },
    { title: '訂購人', key: 'user.account', sortable: true },
    { title: '總價', key: 'totalPrice', sortable: true, align: 'end' },
    { title: '時間', key: 'createdAt', sortable: true },
  ]

  const menuHeaders = [
    { title: '訂購人', key: 'user', sortable: true },
    { title: '數量', key: 'quantity', sortable: true },
    { title: '時間', key: 'createdAt', sortable: true },
  ]

  const isToday = dateStr => {
    const date = new Date(dateStr)
    const now = new Date()
    return (
      date.getFullYear() === now.getFullYear()
      && date.getMonth() === now.getMonth()
      && date.getDate() === now.getDate()
    )
  }

  const loadOrders = async () => {
    loading.value = true
    try {
      // 假設後端 API 支援 /orders?date=today 這樣的查詢
      // const { data } = await apiService.apiAuth.get('/orders')
      // 修正：使用正確的 service 函式來獲取所有訂單
      const { data } = await orderService.getAll()
      // orders.value = data.data
      // 只保留今天的訂單
      orders.value = data.data.filter(order => isToday(order.createdAt))
    } catch (error) {
      console.error('無法載入訂單', error)
      createSnackbar({
        text: error.response?.data?.message || '無法載入訂單',
        snackbarProps: { color: 'error' },
      })
    } finally {
      loading.value = false
    }
  }

  const userList = computed(() => {
    // 使用 Set 來取得不重複的使用者帳號
    const users = new Set(orders.value.map(order => order.user.account))
    return Array.from(users) // 轉換為陣列
  })
  const ordersByUser = computed(() => {
    const result = {}
    for (const user of userList.value) {
      result[user] = orders.value.filter(order => order.user.account === user)
    }
    return result
  })

  const menuList = computed(() => {
    // 取得所有餐點名稱（不重複）
    const names = new Set()
    for (const order of orders.value) {
      for (const item of order.items) {
        names.add(item.name)
      }
    }
    return Array.from(names)
  })
  const ordersByMenu = computed(() => {
    // 每個餐點名稱對應一個陣列，內容為 { user, quantity, createdAt }
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

  const categoryList = computed(() => {
    // 使用 Set 來取得不重複的餐廳分類
    const categories = new Set(orders.value.map(order => order.restaurant.category))
    return Array.from(categories).filter(Boolean) // 轉換為陣列並過濾掉空值
  })
  const ordersByCategory = computed(() => {
    const result = {}
    for (const category of categoryList.value) {
      result[category] = orders.value.filter(order => order.restaurant.category === category)
    }
    return result
  })
  const menuTotalQuantity = menuName => {
    return ordersByMenu.value[menuName]?.reduce((sum, item) => sum + item.quantity, 0) || 0
  }

  // eslint-disable-next-line
  const filteredOrders = computed(() => {
    return orders.value.filter(order => {
      const userMatch = !selectedUser.value || order.user.account === selectedUser.value
      const categoryMatch = !selectedCategory.value || order.restaurant.category === selectedCategory.value
      return userMatch && categoryMatch
    })
  })

  onMounted(() => {
    loadOrders()
  })
</script>

<style>
/* 讓表格標頭在小螢幕上也能正常顯示 */
.v-data-table-header__content {
  white-space: nowrap;
}
</style>

<route lang="yaml">
  meta:
    title: '訂單'
    # 標題
    # login: 'no-login-only'
    # 只能在沒登入的情況下看
    login: ''
    # admin: false
    # 不是管理員也能看
    admin: true
</route>

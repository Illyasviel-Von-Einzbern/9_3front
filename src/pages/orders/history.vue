<template>
  <v-container>
    <h1 class="text-h4 mb-4">訂單紀錄查詢</h1>
    <v-row>
      <!-- <v-col cols="12" md="4">
        <v-text-field
          v-model="date"
          clearable
          label="選擇日期"
          :max="today"
          type="date"
        />
      </v-col> -->
      <!-- <v-col cols="12" md="8">
        <v-btn :loading="loading" @click="loadHistory">查詢</v-btn>
      </v-col> -->
      <v-col cols="12" md="4">
        <v-menu
          v-model="menu"
          :close-on-content-click="false"
          min-width="290px"
          offset-y
          transition="scale-transition"
        >
          <template #activator="{ props }">
            <v-text-field
              v-model="date"
              v-bind="props"
              clearable
              label="選擇日期"
              :model-value="displayDate"
              readonly
              @click:clear="clearDate"
            />
          </template>
          <v-date-picker
            v-model="date"
            :max="today"
            @update:model-value="menu = false"
          />
        </v-menu>
      </v-col>
    </v-row>
    <v-data-table
      class="mt-4"
      :headers="headers"
      :items="orders"
      :loading="loading"
    >
      <template #[`item.createdAt`]="{ item }">
        {{ new Date(item.createdAt).toLocaleString('zh-TW') }}
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
  </v-container>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import orderService from '@/services/order.js'

  const date = ref('')
  const today = new Date().toISOString().slice(0, 10)
  const menu = ref(false)
  const orders = ref([])
  const loading = ref(false)

  const headers = [
    { title: '種類', key: 'restaurant.category' },
    { title: '餐廳', key: 'restaurant.name' },
    { title: '餐點內容', key: 'items' },
    { title: '訂購人', key: 'user.account' },
    { title: '總價', key: 'totalPrice' },
    { title: '時間', key: 'createdAt' },
  ]

  // 顯示格式：年/月/日
  const displayDate = computed(() => {
    if (!date.value) return ''
    const d = new Date(date.value)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    // return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
    return `${year}/${month}/${day}`
  })

  const clearDate = () => {
    date.value = ''
  }

  const loadHistory = async () => {
    if (!date.value) {
      orders.value = []
      return
    }
    loading.value = true
    try {
      const { data } = await orderService.getAll()
      // 篩選選擇日期的訂單
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

  // 監聽日期變化，自動查詢
  watch(date, () => {
    loadHistory()
  })
</script>

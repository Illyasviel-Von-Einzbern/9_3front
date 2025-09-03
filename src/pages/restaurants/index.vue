<!-- 餐廳列表頁 -->
<template>
  <v-container>
    <v-row align="center" class="mt-15">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          clearable
          dense
          hide-details
          label="搜尋餐廳"
          prepend-icon="mdi-magnify"
          @click:clear="applyFilters"
          @keyup.enter="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="category"
          clearable
          dense
          hide-details
          :items="categories"
          label="分類"
          @change="applyFilters"
        />
      </v-col>
      <v-col class="text-right" cols="12" md="4">
        <v-btn
          class="ml-auto"
          color="#CFB53B"
          prepend-icon="mdi-plus"
          size="x-large"
          transparent
          variant="outlined"
          @click="router.push('/restaurants/create')"
        >
          新增餐廳
        </v-btn>
      </v-col>
    </v-row>

    <v-progress-linear v-if="store.loading" class="mb-4" indeterminate />

    <v-alert v-if="store.error" type="error">
      發生錯誤：{{ store.error.message }}
    </v-alert>

    <!-- 調試信息 -->
    <v-alert v-if="store.restaurants.length === 0 && !store.loading" type="info">
      目前沒有找到餐廳資料
    </v-alert>

    <v-alert v-if="store.restaurants.length > 0 && !store.loading" class="mb-3" variant="plain">
      找到 {{ store.total }} 間餐廳，目前顯示第 {{ page }} 頁（每頁 {{ limit }} 間）
      <div v-if="search || category">
        搜尋條件：{{ search ? `關鍵字「${search}」` : '' }}{{ category ? `分類「${category}」` : '' }}
      </div>

    </v-alert>

    <v-row>
      <v-col
        v-for="r in store.restaurants"
        :key="r._id"
        cols="12"
        md="4"
        sm="6"
      >
        <RestaurantCard :restaurant="r" @click="goToDetail(r._id)">
          <!-- 只有擁有者或管理員能看到編輯按鈕 -->
          <template v-if="user.isLoggedIn && (user.isAdmin || user._id === r.owner)" #actions>
            <v-btn color="primary" :to="`/restaurants/edit/${r._id}`" variant="text">
              編輯
            </v-btn>
          </template>
        </RestaurantCard>
      </v-col>
    </v-row>

    <v-pagination
      v-if="store.total > limit"
      v-model="page"
      class="mt-6"
      :length="Math.ceil(store.total / limit)"
      @update:model-value="applyFilters"
    />
  </v-container>
</template>

<script setup>
  import { nextTick, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import RestaurantCard from '@/components/RestaurantCard.vue'
  import { useRestaurantStore } from '@/stores/restaurantStore'
  import { useUserStore } from '@/stores/user'

  const store = useRestaurantStore()
  const route = useRoute()
  const router = useRouter()
  const user = useUserStore()

  const search = ref(route.query.q || '')
  const category = ref(route.query.category || '')
  // const phone = ref(route.query.phone || '')
  // const address = ref(route.query.address || '')
  // const tags = ref(route.query.tags || '')
  // 沒輸入欄位，使用者無法輸入值，這樣會有問題。
  const page = ref(Number.parseInt(route.query.page) || 1)
  const limit = 9

  const categories = ['食物', '飲料', '其他']

  function pushQuery () {
    const query = {}

    if (search.value && search.value.trim()) {
      query.q = search.value.trim()
    }

    if (category.value && category.value.trim()) {
      query.category = category.value.trim()
    }

    // if (phone.value && phone.value.trim()) {
    //   query.phone = phone.value.trim()
    // }
    // if (address.value && address.value.trim()) {
    //   query.address = address.value.trim()
    // }
    // if (tags.value && tags.value.trim()) {
    //   query.tags = tags.value.trim()
    // }
    // 沒輸入欄位，使用者無法輸入值，這樣會有問題。

    if (page.value > 1) {
      query.page = page.value
    }

    router.push({ query })
  }

  function applyFilters () {
    // if (page.value !== 1) page.value = 1
    // console.log('applyFilters 被呼叫:', {
    //   search: search.value,
    //   category: category.value,
    //   page: page.value,
    // })

    // const query = {}

    // if (search.value && search.value.trim()) {
    //   query.q = search.value.trim()
    // }

    // if (category.value && category.value.trim()) {
    //   query.category = category.value.trim()
    // }

    // if (page.value > 1) {
    //   query.page = page.value
    // }

    // console.log('前端/pages/restaurants/index.vue 準備推送到路由的查詢參數:', query)

    // router.push({ query })
    if (page.value === 1) {
      pushQuery()
    } else {
      page.value = 1
      nextTick(() => {
        pushQuery()
      })
    }
  }

  watch(() => route.query, newQuery => {
    console.log('前端/pages/restaurants/index.vue 路由查詢參數變化:', newQuery)

    const searchParam = newQuery.q || ''
    const categoryParam = newQuery.category || ''
    // const phoneParam = newQuery.phone || ''
    // const addressParam = newQuery.address || ''
    // const tagsParam = newQuery.tags || ''
    const pageParam = Number.parseInt(newQuery.page) || 1

    console.log('前端/pages/restaurants/index.vue 解析後的參數:', { searchParam, categoryParam, pageParam })

    console.log('前端/pages/restaurants/index.vue fetchAll 傳入的參數', {
      search: searchParam,
      category: categoryParam,
      page: pageParam,
      limit,
    })
    store.fetchAll({
      search: searchParam,
      category: categoryParam,
      // phone: phoneParam,
      // address: addressParam,
      // tags: tagsParam,
      page: pageParam,
      limit,
    })
  }, { immediate: true })

  // 監聽 category，立即觸發搜尋
  watch(category, () => {
    applyFilters()
  })

  onMounted(() => {
    console.log('前端/pages/restaurants/index.vue 頁面載入完成')
  })

  function goToDetail (id) {
    router.push(`/restaurants/${id}`)
  }
</script>

<route lang="yaml">
  meta:
    title: '餐廳'
    # 標題
    # login: 'no-login-only'
    # 只能在沒登入的情況下看
    login: ''
    admin: false
    # 不是管理員也能看
</route>

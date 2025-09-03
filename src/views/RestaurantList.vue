<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          clearable
          label="搜尋餐廳"
          prepend-icon="mdi-magnify"
          @keyup.enter="applyFilters"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="category"
          clearable
          :items="categories"
          label="分類"
          @change="applyFilters"
        />
      </v-col>
      <v-col class="text-right" cols="12" md="4">
        <v-btn
          color="primary"
          @click="router.push('/restaurants/create')"
        >➕ 新增餐廳</v-btn>
      </v-col>
    </v-row>

    <v-progress-linear v-if="store.loading" class="mb-4" indeterminate />

    <v-alert v-if="store.error" type="error">
      發生錯誤：{{ store.error.message }}
    </v-alert>

    <v-row>
      <v-col
        v-for="r in store.restaurants"
        :key="r._id"
        cols="12"
        md="4"
        sm="6"
      >
        <RestaurantCard :restaurant="r" @click="goToDetail(r._id)" />
      </v-col>
    </v-row>

    <v-pagination
      v-model="page"
      class="mt-6"
      :length="Math.ceil(store.total / limit)"
      @input="applyFilters"
    />
  </v-container>
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import RestaurantCard from '@/components/RestaurantCard.vue'
  import { useRestaurantStore } from '@/stores/restaurantStore'

  const store = useRestaurantStore()
  const route = useRoute()
  const router = useRouter()

  const search = ref(route.query.q || '')
  const category = ref(route.query.category || '')
  const page = ref(Number.parseInt(route.query.page || '1'))
  const limit = 9

  const categories = ['中式', '日式', '美式', '韓式', '早餐', '便當', '甜點']

  function applyFilters () {
    router.push({
      query: {
        q: search.value || undefined,
        category: category.value || undefined,
        page: page.value,
      },
    })
  }

  // watch(() => route.query, () => {
  //   store.fetchAll({
  //     search: route.query.q || '',
  //     category: route.query.category || '',
  //     page: Number.parseInt(route.query.page || '1'),
  //     limit,
  //   })
  // })
  watch(() => route.query, newQuery => {
    search.value = newQuery.q || ''
    category.value = newQuery.category || ''
    page.value = Number.parseInt(newQuery.page) || 1

    console.log('路由查詢參數變化:', newQuery)
    console.log('同步更新search, category, page:', { search: search.value, category: category.value, page: page.value })

    store.fetchAll({
      search: search.value,
      category: category.value,
      page: page.value,
      limit,
    })
  }, { immediate: true })

  onMounted(() => {
    store.fetchAll({
      search: route.query.q || '',
      category: route.query.category || '',
      page: Number.parseInt(route.query.page || '1'),
      limit,
    })
  })

  function goToDetail (id) {
    router.push(`/restaurants/${id}`)
  }
</script>

<style scoped>
body{
  background-color: #f00;
}
v-container{
  background-color: #f00;
}
v-row{
  background-color: #f00;
}
v-col{
  background-color: #f00;
}
</style>

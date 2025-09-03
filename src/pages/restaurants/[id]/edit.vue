<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">編輯餐廳</h1>
      </v-col>
    </v-row>
    <v-form v-if="!loading && form.name" @submit.prevent="submitForm">
      <v-row>
        <!-- Restaurant Details -->
        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>餐廳資訊</v-card-title>
            <v-card-text>
              <v-text-field v-model="form.name" label="餐廳名稱" :rules="[rules.required]" />
              <v-text-field v-model="form.phone" label="電話" :rules="[rules.required]" />
              <v-text-field v-model="form.address" label="地址" />
              <v-text-field v-model="form.link" label="相關連結 (例如: Google Map, Facebook)" />
              <v-select v-model="form.category" :items="['食物', '飲料', '其他']" label="分類" :rules="[rules.required]" />
              <v-combobox
                v-model="form.tags"
                chips
                closable-chips
                :items="defaultTags"
                label="標籤 (輸入後按 Enter 新增)"
                multiple
              />
              <v-file-input v-model="form.image" accept="image/*" clearable label="更換圖片" />
              <v-switch v-model="form.delivery" color="primary" label="提供外送服務" />
              <v-row v-if="form.delivery">
                <v-col cols="6">
                  <v-text-field v-model.number="form.delivery_price" label="外送最低金額" prefix="$" type="number" />
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model.number="form.delivery_number" label="外送所需份數" suffix="份" type="number" />
                </v-col>
              </v-row>
              <v-text-field v-model="form.order_time" label="最後點餐時間" />
              <v-switch v-model="form.sell" color="primary" label="上架" />
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Menu & Business Hours -->
        <v-col cols="12" md="6">
          <v-card class="mb-4">
            <v-card-title>菜單管理</v-card-title>
            <v-card-text>
              <div v-for="(item, index) in form.menu" :key="`menu-${index}`" class="d-flex align-center mb-2">
                <v-text-field
                  v-model="item.name"
                  class="mr-2"
                  density="compact"
                  hide-details
                  label="品項名稱"
                />
                <v-text-field
                  v-model.number="item.price"
                  class="mr-2"
                  density="compact"
                  hide-details
                  label="價格"
                  style="max-width: 100px;"
                  type="number"
                />
                <v-btn color="error" icon="mdi-delete" size="small" @click="removeMenuItem(index)" />
              </div>
              <v-btn block color="primary" variant="tonal" @click="addMenuItem">新增菜單品項</v-btn>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>營業時間</v-card-title>
            <v-card-text>
              <v-row v-for="(item, index) in form.business_hours" :key="`day-${index}`" align="center" no-gutters>
                <v-col cols="2">
                  <span class="font-weight-bold">{{ item.day }}</span>
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="item.open"
                    density="compact"
                    :disabled="item.isClosed"
                    hide-details
                    label="開店"
                    type="time"
                  />
                </v-col>
                <v-col cols="4">
                  <v-text-field
                    v-model="item.close"
                    density="compact"
                    :disabled="item.isClosed"
                    hide-details
                    label="關店"
                    type="time"
                  />
                </v-col>
                <v-col class="text-right" cols="2">
                  <v-checkbox-btn v-model="item.isClosed" />
                  <span class="text-caption">休息</span>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="text-right" cols="12">
          <v-btn color="success" :loading="submitting" type="submit">儲存變更</v-btn>
          <v-btn class="ml-2" color="grey" :to="`/restaurants/${restaurantId}`">取消</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-row v-else>
      <v-col class="text-center" cols="12">
        <div v-if="loading">
          <v-progress-circular color="primary" indeterminate />
          <p class="mt-2">載入資料中...</p>
        </div>
        <div v-else>找不到餐廳資料</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import restaurantService from '@/services/restaurant.js'
  import tagService from '@/services/tag.js'

  const route = useRoute()
  const router = useRouter()
  const createSnackbar = useSnackbar()

  const loading = ref(true)
  const submitting = ref(false)
  const defaultTags = ref([])

  const form = ref({
    name: '',
    phone: '',
    address: '',
    link: '',
    category: '',
    tags: [],
    delivery: false,
    delivery_price: 0,
    delivery_number: 0,
    order_time: '',
    sell: true,
    menu: [],
    business_hours: [],
    image: [], // v-file-input model is an array
  })

  const rules = {
    required: value => !!value || '此欄位為必填',
  }

  const restaurantId = route.params.id

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  onMounted(async () => {
    try {
      const { data: tagData } = await tagService.getDefaultTags()
      if (tagData && Array.isArray(tagData)) {
        defaultTags.value = tagData.map(tag => tag.name)
      } else {
        console.warn('從 API 收到的標籤資料格式不正確或為空')
        defaultTags.value = []
      }

      const { data: restaurantData } = await restaurantService.getById(restaurantId)

      if (restaurantData && restaurantData.data) {
        const restaurant = restaurantData.data
        form.value.name = restaurant.name || ''
        form.value.phone = restaurant.phone || ''
        form.value.address = restaurant.address || ''
        form.value.link = restaurant.link || ''
        form.value.category = restaurant.category || ''
        form.value.delivery = restaurant.delivery || false
        form.value.delivery_price = restaurant.delivery_price || 0
        form.value.delivery_number = restaurant.delivery_number || 0
        form.value.order_time = restaurant.order_time || ''
        form.value.sell = restaurant.sell ?? true

        // 確保 tags 和 menu 是陣列
        form.value.tags = Array.isArray(restaurant.tags) ? restaurant.tags.map(tag => tag.name) : []
        form.value.menu = Array.isArray(restaurant.menu) ? restaurant.menu.map(item => ({ name: item.name, price: item.price })) : []

        // 處理營業時間
        const apiHours = restaurant.business_hours || []
        form.value.business_hours = daysOfWeek.map(day => {
          const foundDay = apiHours.find(apiDay => apiDay.day === day)
          return foundDay || { day, open: '', close: '', isClosed: true }
        })
      } else {
        throw new Error('從 API 收到的餐廳資料格式不正確')
      }
    } catch (error) {
      console.error('載入餐廳資料失敗', error)
      createSnackbar({
        text: '載入餐廳資料失敗',
        snackbarProps: { color: 'error' },
      })
    } finally {
      loading.value = false
    }
  })

  const addMenuItem = () => {
    form.value.menu.push({ name: '', price: null })
  }

  const removeMenuItem = index => {
    form.value.menu.splice(index, 1)
  }

  const submitForm = async () => {
    submitting.value = true
    const formData = new FormData()

    // 將表單資料加入 FormData
    formData.append('name', form.value.name)
    formData.append('phone', form.value.phone)
    formData.append('address', form.value.address)
    formData.append('link', form.value.link)
    formData.append('category', form.value.category)
    formData.append('delivery', form.value.delivery)
    formData.append('delivery_price', form.value.delivery_price)
    formData.append('delivery_number', form.value.delivery_number)
    formData.append('order_time', form.value.order_time)
    formData.append('sell', form.value.sell)

    formData.append('tags', JSON.stringify(form.value.tags))
    formData.append('menu', JSON.stringify(form.value.menu.filter(item => item.name && item.price > 0)))
    formData.append('business_hours', JSON.stringify(form.value.business_hours))

    if (form.value.image && form.value.image.length > 0) {
      formData.append('image', form.value.image[0])
    }

    try {
      await restaurantService.update(restaurantId, formData)
      createSnackbar({
        text: '餐廳更新成功',
        snackbarProps: { color: 'success' },
      })
      router.push(`/restaurants/${restaurantId}`)
    } catch (error) {
      console.error('更新餐廳失敗', error)
      createSnackbar({
        text: error.response?.data?.message || '更新失敗',
        snackbarProps: { color: 'error' },
      })
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
.v-card + .v-card {
  margin-top: 16px;
}
</style>

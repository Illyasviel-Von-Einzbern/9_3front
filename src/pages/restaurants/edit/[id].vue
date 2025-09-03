<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">編輯餐廳</h1>
      </v-col>
    </v-row>
    <v-form v-if="!loading && form.name" @submit.prevent="submitForm">
      <v-card class="pa-4">
        <v-card-title>📋 餐廳資訊</v-card-title>
        <v-card-text>
          <!-- 圖片上傳 -->
          <v-file-input v-model="form.image" accept="image/*" clearable label="更換圖片" />

          <!-- 餐廳名稱 -->
          <v-text-field v-model="form.name" label="餐廳名稱" :rules="[rules.required]" />

          <!-- 電話 -->
          <v-text-field v-model="form.phone" label="餐廳電話" :rules="[rules.required]" />

          <!-- 地址 -->
          <v-text-field v-model="form.address" label="餐廳地址" />

          <!-- 網址 -->
          <v-text-field v-model="form.link" label="餐廳外部連結（GOOGLE、FB）" />

          <!-- 分類 -->
          <v-select v-model="form.category" :items="['食物', '飲料', '其他']" label="分類" :rules="[rules.required]" />

          <!-- Tags -->
          <v-combobox
            v-model="form.tags"
            chips
            closable-chips
            :items="defaultTags"
            label="標籤 (輸入後按 Enter 新增)"
            multiple
          />

          <!-- 外送服務 -->
          <v-switch v-model="form.delivery" color="primary" label="提供外送服務" />
          <v-row v-if="form.delivery">
            <v-col cols="6">
              <v-text-field v-model.number="form.delivery_price" label="外送最低金額" prefix="$" type="number" />
            </v-col>
            <v-col cols="6">
              <v-text-field v-model.number="form.delivery_number" label="外送所需份數" suffix="份" type="number" />
            </v-col>
          </v-row>

          <!-- 點餐時間 -->
          <v-text-field v-model="form.order_time" label="最後點餐時間" />

          <!-- 是否上架 -->
          <v-switch v-model="form.sell" color="primary" label="上架" />

          <v-divider class="my-4" />

          <!-- 營業時間管理 -->
          <h3 class="text-h6 mb-2">🕒 營業時間設定</h3>

          <!-- 快速設定按鈕 -->
          <div class="mb-4">
            <v-btn-group>
              <v-btn size="small" @click="setAllDaysOpen">全部營業</v-btn>
              <v-btn size="small" @click="setWeekdaysOpen">平日營業</v-btn>
              <v-btn size="small" @click="setAllDaysClosed">全部休息</v-btn>
            </v-btn-group>
          </div>

          <div v-for="day in form.business_hours" :key="day.day" class="mb-3">
            <v-row>
              <v-col cols="3">
                <v-select
                  v-model="day.day"
                  density="compact"
                  :items="dayOptions"
                  label="星期"
                />
              </v-col>
              <v-col cols="3">
                <v-checkbox
                  v-model="day.isClosed"
                  density="compact"
                  hide-details
                  label="休息"
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="day.open"
                  density="compact"
                  :disabled="day.isClosed"
                  label="開始時間"
                  type="time"
                />
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="day.close"
                  density="compact"
                  :disabled="day.isClosed"
                  label="結束時間"
                  type="time"
                />
              </v-col>
            </v-row>
          </div>

          <v-divider class="my-4" />

          <!-- 菜單快速匯入區塊 -->
          <h3 class="text-h6 mb-2">📦 快速新增菜單</h3>

          <!-- 整體菜單圖片上傳 -->
          <v-file-input
            v-model="menuImageFile"
            accept="image/png, image/jpeg"
            class="mb-3"
            label="整體菜單圖片（選填）"
            prepend-icon="mdi-image"
            show-size
          />

          <!-- 下載 Excel 範本按鈕 -->
          <v-btn
            class="mb-3"
            color="green darken-1"
            dark
            elevation="2"
            @click="downloadTemplate"
          >
            <v-icon left>mdi-download</v-icon>
            下載範本 Excel
          </v-btn>

          <!-- 上傳 Excel 檔 -->
          <v-file-input
            v-model="excelFile"
            accept=".xlsx"
            label="上傳 Excel（含欄位 name, price, description）"
            prepend-icon="mdi-file-excel"
            show-size
          />

          <!-- 上傳 Excel 檔時，資料預設 -->
          <v-switch
            v-model="appendMode"
            class="mb-4"
            inset
            label="匯入菜單時： 覆蓋（關閉） / 合併（開啟）"
          />

          <!-- 或貼上 JSON -->
          <v-textarea
            v-model="menuJson"
            auto-grow
            label="或貼上 JSON 陣列"
            placeholder="[{&quot;name&quot;: &quot;咖哩飯&quot;, &quot;price&quot;: 100, &quot;description&quot;: &quot;美味&quot;}]"
            rows="5"
          />
          <v-btn class="mt-2 mb-6" color="primary" @click="importJson">📥 匯入 JSON</v-btn>

          <!-- 可編輯菜單清單 -->
          <h3 class="text-h6 mb-2">📝 菜單編輯</h3>
          <div v-for="(item, index) in form.menu" :key="index" class="my-2">
            <v-row align="center" dense style="gap: 8px;">
              <!-- 菜單項目圖片 -->
              <v-col cols="2">
                <v-file-input
                  v-model="item.image"
                  accept="image/png, image/jpeg"
                  density="compact"
                  hide-details
                  label="項目圖片"
                  prepend-icon="mdi-image"
                  show-size
                />
              </v-col>

              <!-- 菜單名稱 -->
              <v-col cols="3">
                <v-text-field
                  v-model="item.name"
                  clearable
                  dense
                  label="項目"
                  placeholder="請輸入菜名"
                  :rules="[v => !!v || '必填']"
                />
              </v-col>

              <!-- 價格 -->
              <v-col cols="2">
                <v-text-field
                  v-model.number="item.price"
                  clearable
                  dense
                  label="價格"
                  placeholder="0"
                  :rules="[v => v >= 0 || '價格不能小於 0']"
                  type="number"
                />
              </v-col>

              <!-- 描述 -->
              <v-col cols="4">
                <v-text-field
                  v-model="item.description"
                  clearable
                  dense
                  label="描述"
                  placeholder="請輸入描述"
                />
              </v-col>

              <!-- 刪除按鈕 -->
              <v-col class="d-flex justify-center" cols="1">
                <v-btn
                  color="error"
                  icon
                  small
                  title="刪除"
                  @click="removeMenuItem(index)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-divider />
          </div>

          <v-btn color="success" @click="addMenuItem">＋ 新增菜單項目</v-btn>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn color="success" :loading="submitting" type="submit">儲存變更</v-btn>
          <v-btn class="ml-2" color="grey" :to="`/restaurants/${restaurantId}`">取消</v-btn>
        </v-card-actions>
      </v-card>
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
  import { onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as XLSX from 'xlsx'
  import restaurantService from '@/services/restaurant.js'
  import tagService from '@/services/tag.js'

  const route = useRoute()
  const router = useRouter()
  const createSnackbar = useSnackbar()

  const loading = ref(true)
  const submitting = ref(false)
  const defaultTags = ref([])
  const menuImageFile = ref(null)
  const excelFile = ref(null)
  const menuJson = ref('')
  const appendMode = ref(false)

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

  const dayOptions = [
    { title: '星期一', value: 'Mon' },
    { title: '星期二', value: 'Tue' },
    { title: '星期三', value: 'Wed' },
    { title: '星期四', value: 'Thu' },
    { title: '星期五', value: 'Fri' },
    { title: '星期六', value: 'Sat' },
    { title: '星期日', value: 'Sun' },
  ]

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
        form.value.tags = Array.isArray(restaurant.tags)
          ? restaurant.tags.map(tag => tag.name)
          : []
        form.value.menu = Array.isArray(restaurant.menu)
          ? restaurant.menu.map(item => ({
            name: item.name,
            price: item.price,
            description: item.description || '',
            image: null,
          }))
          : []

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
    form.value.menu.push({ name: '', price: null, description: '', image: null })
  }

  const removeMenuItem = index => {
    form.value.menu.splice(index, 1)
  }

  // 快速設定營業時間的方法
  const setAllDaysOpen = () => {
    for (const day of form.value.business_hours) {
      day.isClosed = false
      day.open = '09:00'
      day.close = '18:00'
    }
  }

  const setWeekdaysOpen = () => {
    for (const day of form.value.business_hours) {
      const isWeekend = day.day === 'Sat' || day.day === 'Sun'
      day.isClosed = isWeekend
      if (!isWeekend) {
        day.open = '09:00'
        day.close = '18:00'
      }
    }
  }

  const setAllDaysClosed = () => {
    for (const day of form.value.business_hours) {
      day.isClosed = true
    }
  }

  const getDayName = day => {
    const dayNames = {
      Mon: '星期一',
      Tue: '星期二',
      Wed: '星期三',
      Thu: '星期四',
      Fri: '星期五',
      Sat: '星期六',
      Sun: '星期日',
    }
    return dayNames[day] || day
  }

  // 匯入 JSON 按鈕處理
  function importJson () {
    try {
      const parsed = JSON.parse(menuJson.value)
      if (Array.isArray(parsed)) {
        form.value.menu = parsed.map(i => ({
          name: i.name || '',
          price: i.price || 0,
          description: i.description || '',
          image: null,
        }))
      } else {
        alert('JSON 格式錯誤，請確認為陣列格式')
      }
    } catch {
      alert('無法解析 JSON')
    }
  }

  // 處理 Excel 上傳
  watch(excelFile, async newFile => {
    if (!newFile) return

    try {
      const data = new Uint8Array(await newFile.arrayBuffer())
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const parsed = XLSX.utils.sheet_to_json(sheet)

      // 自動轉換欄位
      const translated = parsed.map(row => ({
        name: row.name || row.菜名 || row.品項 || row.項目 || '',
        price: row.price || row.價格 || row.單價 || 0,
        description: row.description || row.描述 || row.說明 || '',
        image: null,
      }))

      const filtered = translated.filter(item => item.name || item.price)

      form.value.menu = appendMode.value ? form.value.menu.concat(filtered) : filtered
    } catch (error) {
      console.error('Excel 解析錯誤', error)
      alert('無法解析 Excel，請確認檔案內容是否正確')
    } finally {
      excelFile.value = null
    }
  })

  function downloadTemplate () {
    // 建立範本資料
    const templateData = [
      { name: '菜名範例', price: 87, description: '描述範例' },
    ]

    // 把資料轉成 worksheet
    const ws = XLSX.utils.json_to_sheet(templateData)

    // 建立新的 workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '菜單範本')

    // 產生檔案並下載
    XLSX.writeFile(wb, 'menu_template.xlsx')
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

    // 添加整體菜單圖片
    if (menuImageFile.value) {
      formData.append('menuImage', menuImageFile.value)
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

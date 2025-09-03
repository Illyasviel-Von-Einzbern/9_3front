<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">餐廳管理</h1>
      </v-col>

      <v-divider />

      <v-col cols="12">
        <v-data-table
          :filter-keys="filterKeys"
          :headers="headers"
          :items="restaurants"
          :search="search"
        >
          <template #top>
            <v-toolbar>
              <v-btn variant="outlined" @click="openDialog(null)">
                新增餐廳
              </v-btn>
              <v-spacer />
              <v-text-field
                v-model="search"
                density="compact"
                hide-details
                placeholder="搜尋餐廳"
                prepend-inner-icon="mdi-magnify"
                variant="solo"
              />
            </v-toolbar>
          </template>

          <template #[`item.image`]="{ value }">
            <v-img :src="value" width="75" />
          </template>

          <template #[`item.delivery`]="{ value }">
            <v-icon :icon="value ? 'mdi-check' : 'mdi-close'" />
          </template>

          <template #[`item.sell`]="{ value }">
            <v-icon :icon="value ? 'mdi-check' : 'mdi-close'" />
          </template>

          <template #[`item.isDeleted`]="{ value }">
            <v-chip
              :color="value ? 'error' : 'success'"
              size="small"
              variant="outlined"
            >
              {{ value ? '已刪除' : '正常' }}
            </v-chip>
          </template>

          <template #[`item.action`]="{ item }">
            <v-btn
              :disabled="item.isDeleted"
              icon="mdi-pencil"
              variant="text"
              @click="openDialog(item)"
            />
            <v-btn
              v-if="!item.isDeleted"
              color="error"
              icon="mdi-delete"
              variant="text"
              @click="deleteRestaurant(item._id)"
            />
            <v-btn
              v-else
              color="success"
              icon="mdi-restore"
              variant="text"
              @click="restoreRestaurant(item._id)"
            />
          </template>

          <template #[`item.business_hours`]="{ value }">
            <BusinessHours :hours="value" />
          </template>

          <template #[`item.tags`]="{ value }">
            <div v-if="value && value.length > 0">
              <v-chip
                v-for="tag in value"
                :key="tag._id"
                class="ma-1"
                color="primary"
                size="small"
                variant="outlined"
              >
                {{ tag.name }}
              </v-chip>
            </div>
            <span v-else class="text-grey">無標籤</span>
          </template>

          <template #[`item.reviews`]="{ value }">
            <div v-if="value && value.length > 0">
              <v-chip color="success" size="small" variant="outlined">
                {{ value.length }} 則評論
              </v-chip>
            </div>
            <span v-else class="text-grey">無評論</span>
          </template>

          <template #[`item.average_score`]="{ value }">
            <div v-if="value && value > 0">
              <v-rating
                density="compact"
                half-increments
                :model-value="value"
                readonly
                size="small"
              />
              <span class="ml-1">{{ value.toFixed(1) }}</span>
            </div>
            <span v-else class="text-grey">無評分</span>
          </template>

          <template #[`item.review_count`]="{ value }">
            <span>{{ value || 0 }}</span>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 餐廳表單 Dialog -->
    <v-dialog v-model="dialog.open" persistent width="900">
      <v-form :disabled="isSubmitting" @submit.prevent="submit">
        <v-card>
          <v-card-title>{{ dialog.id ? '編輯餐廳' : '新增餐廳' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="name.value.value" :error-messages="name.errorMessage.value" label="名稱" />
            <v-text-field v-model="phone.value.value" :error-messages="phone.errorMessage.value" label="電話" />
            <v-text-field v-model="address.value.value" :error-messages="address.errorMessage.value" label="地址" />
            <v-text-field v-model="link.value.value" :error-messages="link.errorMessage.value" label="連結" />

            <v-select
              v-model="category.value.value"
              :error-messages="category.errorMessage.value"
              :items="categoryOptions"
              label="分類"
            />

            <v-checkbox
              v-model="delivery.value.value"
              :error-messages="delivery.errorMessage.value"
              hide-details
              label="是否外送"
            />

            <v-row v-if="delivery.value.value">
              <v-col cols="6">
                <v-text-field
                  v-model.number="delivery_price.value.value"
                  :error-messages="delivery_price.errorMessage.value"
                  label="外送金額"
                  min="0"
                  type="number"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model.number="delivery_number.value.value"
                  :error-messages="delivery_number.errorMessage.value"
                  label="外送份數"
                  min="0"
                  type="number"
                />
              </v-col>
            </v-row>

            <v-text-field v-model="order_time.value.value" label="訂餐時間" />

            <!-- 標籤編輯 -->
            <v-combobox
              v-model="tags"
              chips
              clearable
              hide-details
              label="標籤"
              multiple
              placeholder="早餐、午餐、飲料、飯、麵、餃子．．．等"
              small-chips
            />

            <!-- 營業時間編輯 -->
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>營業時間設定</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <!-- 快速設定按鈕 -->
                  <div class="mb-4">
                    <v-btn-group>
                      <v-btn size="small" @click="setAllDaysOpen">全部營業</v-btn>
                      <v-btn size="small" @click="setWeekdaysOpen">平日營業</v-btn>
                      <v-btn size="small" @click="setAllDaysClosed">全部休息</v-btn>
                    </v-btn-group>
                  </div>

                  <div v-for="day in businessHours" :key="day.day" class="mb-3">
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
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <v-checkbox
              v-model="sell.value.value"
              :error-messages="sell.errorMessage.value"
              hide-details
              label="上架"
            />

            <!-- 菜單編輯 -->
            <v-expansion-panels>
              <v-expansion-panel>
                <v-expansion-panel-title>菜單管理</v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div v-for="(item, index) in menu" :key="index" class="my-2">
                    <v-row align="center" dense style="gap: 12px;">
                      <v-col cols="4">
                        <v-text-field
                          v-model="item.name"
                          clearable
                          dense
                          label="項目"
                          placeholder="請輸入菜名"
                        />
                      </v-col>
                      <v-col cols="2">
                        <v-text-field
                          v-model.number="item.price"
                          clearable
                          dense
                          label="價格"
                          placeholder="0"
                          type="number"
                        />
                      </v-col>
                      <v-col cols="4">
                        <v-text-field
                          v-model="item.description"
                          clearable
                          dense
                          label="描述"
                          placeholder="請輸入描述"
                        />
                      </v-col>
                      <v-col class="d-flex justify-center" cols="1">
                        <v-btn
                          color="error"
                          icon
                          small
                          title="刪除"
                          @click="removeMenu(index)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                    <v-divider />
                  </div>
                  <v-btn color="success" @click="addMenu">＋ 新增菜單項目</v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- 菜單圖片上傳 -->
            <v-file-input
              v-model="menuImageFile"
              accept="image/png, image/jpeg"
              label="菜單圖片（選填）"
              prepend-icon="mdi-image"
              show-size
            />

            <!-- 圖片上傳 -->
            <!-- eslint-disable -->
            <VueFileAgent
              ref="fileAgent"
              v-model="fileRecords"
              v-model:raw-model-value="rawFileRecords"
              accept="image/jpeg,image/png"
              deletable
              :error-text="{ type: '檔案格式不正確', size: '檔案大小不得超過 1MB' }"
              help-text="選擇或拖拽圖片"
              max-size="1MB"
            />
            <!-- eslint-enable -->
          </v-card-text>

          <v-card-actions>
            <v-btn color="red" :disabled="isSubmitting" @click="closeDialog">取消</v-btn>
            <v-btn color="green" :loading="isSubmitting" type="submit">{{ dialog.id ? '編輯' : '新增' }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { useField, useForm } from 'vee-validate'
  import { ref, useTemplateRef, watch } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import BusinessHours from '@/components/BusinessHours.vue'
  import restaurantService from '@/services/restaurant'

  const createSnackbar = useSnackbar()

  // ************************
  // * 餐廳列表與搜尋 *
  // ************************
  const restaurants = ref([])
  const search = ref('')
  const headers = [
    { title: '圖片', key: 'image', sortable: false },
    { title: '名稱', key: 'name' },
    { title: '分類', key: 'category' },
    { title: '電話', key: 'phone', sortable: false },
    { title: '地址', key: 'address', sortable: false },
    { title: '網址', key: 'link', sortable: false },
    { title: '標籤', key: 'tags', sortable: false },
    { title: '評論', key: 'reviews', sortable: false },
    { title: '平均評分', key: 'average_score', sortable: true },
    { title: '評論數量', key: 'review_count', sortable: true },
    { title: '外送', key: 'delivery' },
    { title: '外送金額', key: 'delivery_price' },
    { title: '外送數量', key: 'delivery_number' },
    { title: '營業時間', key: 'business_hours' },
    { title: '訂餐時間', key: 'order_time' },
    { title: '上架', key: 'sell' },
    { title: '狀態', key: 'isDeleted' },
    { title: '操作', key: 'action', sortable: false },
  ]
  const filterKeys = ['name', 'category', 'phone', 'address']

  const getRestaurants = async () => {
    try {
      // 管理員頁面需要獲取所有餐廳（包括未上架的），所以使用管理員專用的 API
      const { data } = await restaurantService.getAllAdmin()
      console.log('撈到的餐廳資料:', data)
      restaurants.value = Array.isArray(data?.data) ? data.data : []
      // 第一層 data 是 Axios response
      // 第二層 data 是 API 自己的回傳值
    } catch (error) {
      console.error('載入餐廳失敗:', error)
      createSnackbar({ text: '無法載入餐廳資料', snackbarProps: { color: 'red' } })
    }
  }
  getRestaurants()

  // ************************
  // * Dialog 控制 *
  // ************************
  const dialog = ref({ open: false, id: '' })
  const fileAgent = useTemplateRef('fileAgent')

  const openDialog = item => {
    if (item) {
      // 編輯模式
      dialog.value.id = item._id
      name.value.value = item.name
      phone.value.value = item.phone
      address.value.value = item.address
      link.value.value = item.link
      category.value.value = item.category
      delivery.value.value = item.delivery
      delivery_price.value.value = item.delivery_price
      delivery_number.value.value = item.delivery_number
      order_time.value.value = item.order_time
      sell.value.value = item.sell

      // 載入標籤資料
      tags.value = item.tags && item.tags.length > 0
        ? item.tags.map(tag => tag.name || tag)
        : []

      // 載入現有圖片
      if (item.image) {
        fileRecords.value = [{
          name: 'restaurant-image.jpg',
          size: 0,
          type: 'image/jpeg',
          url: item.image,
          file: null,
        }]
      }

      // 載入菜單資料
      menu.value = item.menu && item.menu.length > 0 ? [...item.menu] : []

      // 載入營業時間 - 確保資料完整性
      if (item.business_hours && item.business_hours.length > 0) {
        // 使用展開運算符創建淺拷貝
        businessHours.value = item.business_hours.map(hour => ({ ...hour }))
      } else {
        // 如果沒有營業時間資料，使用預設值
        resetBusinessHours()
      }
    } else {
      // 新增模式
      dialog.value.id = ''
      resetForm()
      resetBusinessHours()
      // 重置標籤和菜單資料
      tags.value = []
      menu.value = []
      menuImageFile.value = null
      if (fileAgent.value) {
        fileAgent.value.deleteFileRecord()
      }
    }
    dialog.value.open = true
  }

  // 重置營業時間為預設值
  const resetBusinessHours = () => {
    businessHours.value = [
      { day: 'Mon', open: '09:00', close: '18:00', isClosed: false },
      { day: 'Tue', open: '09:00', close: '18:00', isClosed: false },
      { day: 'Wed', open: '09:00', close: '18:00', isClosed: false },
      { day: 'Thu', open: '09:00', close: '18:00', isClosed: false },
      { day: 'Fri', open: '09:00', close: '18:00', isClosed: false },
      { day: 'Sat', open: '09:00', close: '18:00', isClosed: false },
      { day: 'Sun', open: '09:00', close: '18:00', isClosed: false },
    ]
  }

  // 快速設定營業時間的方法
  const setAllDaysOpen = () => {
    for (const day of businessHours.value) {
      day.isClosed = false
      day.open = '09:00'
      day.close = '18:00'
    }
  }

  const setWeekdaysOpen = () => {
    for (const day of businessHours.value) {
      const isWeekend = day.day === 'Sat' || day.day === 'Sun'
      day.isClosed = isWeekend
      if (!isWeekend) {
        day.open = '09:00'
        day.close = '18:00'
      }
    }
  }

  const setAllDaysClosed = () => {
    for (const day of businessHours.value) {
      day.isClosed = true
    }
  }

  // 菜單管理方法
  const addMenu = () => {
    menu.value.push({
      name: '',
      price: 0,
      description: '',
    })
  }

  const removeMenu = index => {
    menu.value.splice(index, 1)
  }

  // 刪除餐廳
  const deleteRestaurant = async id => {
    if (!confirm('確定要刪除這間餐廳嗎？此操作無法復原。')) {
      return
    }

    try {
      await restaurantService.delete(id)
      createSnackbar({
        text: '餐廳刪除成功！',
        snackbarProps: { color: 'green' },
      })
      getRestaurants()
    } catch (error) {
      console.error('刪除餐廳失敗:', error)
      const errorMessage = error?.response?.data?.message || error?.message || '刪除失敗，請稍後再試'
      createSnackbar({ text: errorMessage, snackbarProps: { color: 'red' } })
    }
  }

  // 恢復餐廳
  const restoreRestaurant = async id => {
    if (!confirm('確定要恢復這間餐廳嗎？')) {
      return
    }

    try {
      // 這裡需要後端提供恢復 API，暫時使用更新 API
      const fd = new FormData()
      fd.append('isDeleted', 'false')
      await restaurantService.update(id, fd)
      createSnackbar({
        text: '餐廳恢復成功！',
        snackbarProps: { color: 'green' },
      })
      getRestaurants()
    } catch (error) {
      console.error('恢復餐廳失敗:', error)
      const errorMessage = error?.response?.data?.message || error?.message || '恢復失敗，請稍後再試'
      createSnackbar({ text: errorMessage, snackbarProps: { color: 'red' } })
    }
  }

  const closeDialog = () => {
    dialog.value.open = false
    dialog.value.id = ''
    resetForm()
    resetBusinessHours()
    // 重置所有資料
    tags.value = []
    menu.value = []
    menuImageFile.value = null
    if (fileAgent.value) {
      fileAgent.value.deleteFileRecord()
    }
  }

  // ************************
  // * 表單驗證與送出 *
  // ************************
  const categoryOptions = ['食物', '飲料', '其他']
  const dayOptions = [
    { title: '星期一', value: 'Mon' },
    { title: '星期二', value: 'Tue' },
    { title: '星期三', value: 'Wed' },
    { title: '星期四', value: 'Thu' },
    { title: '星期五', value: 'Fri' },
    { title: '星期六', value: 'Sat' },
    { title: '星期日', value: 'Sun' },
  ]

  // 標籤資料
  const tags = ref([])

  // 菜單資料
  const menu = ref([])

  // 營業時間資料
  const businessHours = ref([
    { day: 'Mon', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Tue', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Wed', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Thu', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Fri', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Sat', open: '09:00', close: '18:00', isClosed: false },
    { day: 'Sun', open: '09:00', close: '18:00', isClosed: false },
  ])

  const { handleSubmit, resetForm, isSubmitting } = useForm({
    validationSchema: yup.object({
      name: yup.string().required('餐廳名稱必須填寫').max(100),
      phone: yup.string().required('餐廳電話必須填寫'),
      address: yup.string().max(60),
      link: yup.string().url('請輸入有效網址').max(100),
      category: yup.string().required().oneOf(categoryOptions),
      delivery: yup.boolean().required(),
      delivery_price: yup.number().min(0).when('delivery', {
        is: true,
        // eslint-disable-next-line
        then: schema => schema.required('外送金額必填'),
      }),
      delivery_number: yup.number().min(0).when('delivery', {
        is: true,
        // eslint-disable-next-line
        then: schema => schema.required('外送份數必填'),
      }),
      order_time: yup.string(),
      sell: yup.boolean().required(),
      business_hours: yup.array().of(
        yup.object({
          day: yup.string().required(),
          open: yup.string().when('isClosed', {
            is: false,
            // eslint-disable-next-line
            then: schema => schema.required('開始時間必填'),
          }),
          close: yup.string().when('isClosed', {
            is: false,
            // eslint-disable-next-line
            then: schema => schema.required('結束時間必填'),
          }),
          isClosed: yup.boolean().required(),
        }),
      ),
    }),
    initialValues: {
      name: '',
      phone: '',
      address: '',
      link: '',
      category: '',
      delivery: false,
      delivery_price: 0,
      delivery_number: 0,
      order_time: '',
      sell: true,
    },
  })

  const name = useField('name')
  const phone = useField('phone')
  const address = useField('address')
  const link = useField('link')
  const category = useField('category')
  const delivery = useField('delivery')
  const delivery_price = useField('delivery_price')
  const delivery_number = useField('delivery_number')
  const order_time = useField('order_time')
  const sell = useField('sell')

  const fileRecords = ref([])
  const rawFileRecords = ref([])
  const menuImageFile = ref(null)

  const submit = handleSubmit(async values => {
    // 驗證圖片
    if (fileRecords.value[0]?.error) {
      createSnackbar({ text: '請選擇有效圖片', snackbarProps: { color: 'red' } })
      return
    }

    // 新增時必須上傳圖片
    if (dialog.value.id.length === 0 && fileRecords.value.length === 0) {
      createSnackbar({ text: '請上傳餐廳圖片', snackbarProps: { color: 'red' } })
      return
    }

    // 驗證營業時間資料
    const invalidHours = businessHours.value.filter(hour => {
      if (hour.isClosed) return false
      return !hour.open || !hour.close
    })

    if (invalidHours.length > 0) {
      createSnackbar({ text: '請完整填寫營業時間', snackbarProps: { color: 'red' } })
      return
    }

    try {
      const fd = new FormData()

      // 添加基本表單資料
      for (const [key, val] of Object.entries(values)) {
        if (val !== undefined && val !== null) {
          fd.append(key, val)
        }
      }

      // 添加標籤資料
      fd.append('tags', JSON.stringify(tags.value))

      // 添加菜單資料
      if (menu.value.length > 0) {
        fd.append('menu', JSON.stringify(menu.value))
      }

      // 添加營業時間資料
      fd.append('business_hours', JSON.stringify(businessHours.value))

      // 添加圖片
      if (fileRecords.value.length > 0) {
        fd.append('image', fileRecords.value[0].file)
      }

      // 添加菜單圖片
      if (menuImageFile.value) {
        fd.append('menuImage', menuImageFile.value)
      }

      // 根據模式選擇 API
      const isEdit = dialog.value.id.length > 0
      const result = isEdit
        ? await restaurantService.update(dialog.value.id, fd)
        : await restaurantService.create(fd)

      createSnackbar({
        text: isEdit ? '餐廳更新成功！' : '餐廳新增成功！',
        snackbarProps: { color: 'green' },
      })

      closeDialog()
      getRestaurants()
    } catch (error) {
      console.error('餐廳操作失敗:', error)
      const errorMessage = error?.response?.data?.message || error?.message || '操作失敗，請稍後再試'
      createSnackbar({ text: errorMessage, snackbarProps: { color: 'red' } })
    }
  })
</script>

<route lang="yaml">
meta:
  layout: admin
  title: 餐廳管理
  login: login-only
  admin: true
</route>

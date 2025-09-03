<!-- RestaurantForm.vue — 餐廳資料編輯/新增表單元件 -->
<!-- 用途： -->
  <!-- 這是用來新增或編輯餐廳詳細資料的表單元件，可以編輯餐廳名稱、電話、地址、分類、標籤、菜單（多項菜單項目）、圖片上傳等。也有支援從 Excel 匯入菜單、貼 JSON 進來的快速匯入功能。 -->
<!-- 主要功能： -->
  <!-- 餐廳基本資料表單（名稱、電話、地址、分類、標籤、是否上架） -->
  <!-- 圖片上傳與預覽 -->
  <!-- 菜單列表管理（新增、刪除菜單項目） -->
  <!-- Excel 匯入菜單（自動解析菜單欄位） -->
  <!-- 貼上 JSON 陣列匯入菜單 -->
  <!-- 表單驗證（必填欄位、格式） -->
  <!-- 送出表單後會呼叫 store.createRestaurant() 將資料送出（你自己的資料存取方法） -->
<!-- 怎麼用？ -->
<!-- 引入元件後監聽 success 事件（新增完成時通知父元件），範例： -->
<!-- <RestaurantForm @success="onCreateSuccess" /> -->
<!-- 內部會管理自己的表單狀態，使用者透過畫面操作輸入資料。 -->
<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-card class="pa-4">
      <v-card-title>📋 餐廳資訊</v-card-title>
      <v-card-text>
        <!-- 圖片上傳 -->
        <v-file-input
          v-model="imageFile"
          accept="image/png, image/jpeg"
          label="上傳圖片"
          prepend-icon="mdi-image"
          :rules="[fileRule]"
          show-size
        />

        <!-- 預覽 -->
        <v-img
          v-if="imageFile"
          class="my-3"
          cover
          height="200"
          :src="previewUrl"
        />

        <!-- 餐廳名稱 -->
        <v-text-field
          v-model="form.name"
          label="餐廳名稱"
          :rules="[v => !!v || '必填']"
        />

        <!-- 電話 -->
        <v-text-field
          v-model="form.phone"
          label="餐廳電話"
          :rules="[v => !!v || '必填']"
        />

        <!-- 地址 -->
        <v-text-field
          v-model="form.address"
          label="餐廳地址"
        />

        <!-- 網址 -->
        <v-text-field
          v-model="form.link"
          label="餐廳外部連結（GOOGLE、FB）"
        />

        <!-- 分類 -->
        <v-select
          v-model="form.category"
          :items="categories"
          label="分類"
          required
          :rules="[v => !!v || '必填']"
        />

        <!-- Tags -->
        <v-combobox
          v-model="form.tags"
          chips
          clearable
          hide-details
          label="標籤"
          multiple
          placeholder="早餐、午餐、飲料、飯、麵、餃子．．．等"
          small-chips
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
        <v-switch
          v-model="form.sell"
          label="是否上架"
        />

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

        <v-divider class="my-4" />

        <!-- 新增：菜單快速匯入區塊 -->
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

        <!-- 新增：下載 Excel 範本按鈕 -->
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
            <v-col cols="3">
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
                @click="removeMenu(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-divider />
        </div>

        <!-- 直的表單 -->
        <!-- <div v-for="(item, index) in form.menu" :key="index" class="mb-3">
          <v-text-field
            v-model="item.name"
            label="菜單名稱"
            :rules="[v => !!v || '必填']"
          />
          <v-text-field
            v-model.number="item.price"
            label="價格"
            type="number"
            :rules="[v => v >= 0 || '價格不能小於 0']"
          />
          <v-text-field
            v-model="item.description"
            label="描述"
          />
          <v-btn small color="error" @click="removeMenu(index)">刪除</v-btn>
          <v-divider class="my-2" />
        </div> -->

        <v-btn color="success" @click="addMenu">＋ 新增菜單項目</v-btn>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" type="submit" variant="elevated">💾 儲存</v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import * as XLSX from 'xlsx'
  import { useRestaurantStore } from '@/stores/restaurantStore'

  const emit = defineEmits(['success'])
  const store = useRestaurantStore()

  const formRef = ref(null)

  // 表單資料（含菜單陣列）
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
    menu: [], // 菜單陣列
  })

  const categories = ['食物', '飲料', '其他']

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

  const dayOptions = [
    { title: '星期一', value: 'Mon' },
    { title: '星期二', value: 'Tue' },
    { title: '星期三', value: 'Wed' },
    { title: '星期四', value: 'Thu' },
    { title: '星期五', value: 'Fri' },
    { title: '星期六', value: 'Sat' },
    { title: '星期日', value: 'Sun' },
  ]

  // 圖片上傳相關
  const imageFile = ref(null)
  const menuImageFile = ref(null)
  const previewUrl = computed(() =>
    imageFile.value ? URL.createObjectURL(imageFile.value) : null,
  )

  const fileRule = file => {
    if (!file) return '必須上傳圖片'
    if (file.size > 1024 * 1024) return '檔案過大（1MB 以下）'
    return true
  }

  const menuJson = ref('') // 用來貼上 JSON 的 textarea 文字

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
  const excelFile = ref(null)

  // 原本預設是 @change (@change="handleExcel")
  // function handleExcel () {
  //   const file = excelFile.value
  //   if (!file) return

  //   const reader = new FileReader()
  //   reader.addEventListener('load', e => {
  //     try {
  //       const data = new Uint8Array(e.target.result)
  //       const workbook = XLSX.read(data, { type: 'array' })
  //       const sheet = workbook.Sheets[workbook.SheetNames[0]]
  //       const parsed = XLSX.utils.sheet_to_json(sheet)

  //       // 自動對應欄位名稱（支援中英文）
  //       const translated = parsed.map(row => ({
  //         name: row.name || row.菜名 || row.品項 || row.項目 || '',
  //         price: row.price || row.價格 || row.單價 || 0,
  //         description: row.description || row.描述 || row.說明 || '',
  //       }))

  //       // 過濾空白列（至少要有名稱或價格）
  //       const filtered = translated.filter(item => item.name || item.price)

  //       console.log('✅ 匯入成功：', filtered)

  //       form.value.menu = filtered
  //     } catch (error) {
  //       console.error('Excel 解析錯誤：', error)
  //       alert('無法解析 Excel，請確認檔案格式是否正確')
  //     }
  //   })

  //   reader.readAsArrayBuffer(file)
  // }
  // | 使用方式                         | 結構清晰、擴充性高 | 快速、簡單但較零碎   |
  // | ---------------------------- | --------- | ----------- |
  // | `v-model + watch` ✅ 更推薦的正式做法 | ⛔ 稍微複雜一點  |             |
  // | `@change`                    | ✅ 快速上手    | ⛔ 可讀性與可控性略差 |

  // 後來的 watch
  const appendMode = ref(false) // 預設覆蓋

  watch(excelFile, newFile => {
    if (!newFile) return

    const reader = new FileReader()
    reader.addEventListener('load', e => {
      try {
        const data = new Uint8Array(e.target.result)
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

        // eslint-disable-next-line
        if (appendMode.value) {
          // 合併：保留原本菜單，加上新匯入的
          form.value.menu = form.value.menu.concat(filtered)
        } else {
          // 覆蓋
          form.value.menu = filtered
        }
      } catch (error) {
        console.error('Excel 解析錯誤', error)
        alert('無法解析 Excel，請確認檔案內容是否正確')
      } finally {
        excelFile.value = null
      }
    })

    // eslint-disable-next-line
    reader.readAsArrayBuffer(newFile)
  })

  // 新增菜單項目（空白）
  function addMenu () {
    form.value.menu.push({
      name: '',
      price: 0,
      description: '',
      image: null,
    })
  }

  // 刪除菜單項目
  function removeMenu (index) {
    form.value.menu.splice(index, 1)
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

  // 送出表單
  async function handleSubmit () {
    const valid = await formRef.value.validate()
    if (!valid) return

    const data = new FormData()
    data.append('name', form.value.name)
    data.append('phone', form.value.phone)
    data.append('address', form.value.address || '')
    data.append('link', form.value.link || '')
    data.append('category', form.value.category)
    data.append('tags', JSON.stringify(form.value.tags || []))
    data.append('delivery', form.value.delivery)
    data.append('delivery_price', form.value.delivery_price)
    data.append('delivery_number', form.value.delivery_number)
    data.append('order_time', form.value.order_time)
    data.append('sell', form.value.sell ? 'true' : 'false')
    if (imageFile.value) data.append('image', imageFile.value)

    // 菜單資料轉成 JSON 字串一起送
    if (form.value.menu.length > 0) {
      data.append('menu', JSON.stringify(form.value.menu))
    }

    // 營業時間資料轉成 JSON 字串一起送
    data.append('business_hours', JSON.stringify(businessHours.value))

    // 添加整體菜單圖片
    if (menuImageFile.value) {
      data.append('menuImage', menuImageFile.value)
    }

    try {
      await store.createRestaurant(data)
      emit('success')
    } catch (error) {
      console.error('新增失敗', error)
    }
  }

  function downloadTemplate () {
    // 建立範本資料
    const templateData = [
      { name: '菜名範例', price: 100, description: '描述範例' },
    ]

    // 把資料轉成 worksheet
    const ws = XLSX.utils.json_to_sheet(templateData)

    // 建立新的 workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '菜單範本')

    // 產生檔案並下載
    XLSX.writeFile(wb, 'menu_template.xlsx')
  }

  // // 按鈕價格增減
  // const price = ref(0)

  // function increasePrice (index, amount) {
  //   if (!form.value.menu[index]) return
  //   form.value.menu[index].price = Math.max(0, (Number(form.value.menu[index].price) || 0) + amount)
  // }

  // function decreasePrice (index, amount) {
  //   if (!form.value.menu[index]) return
  //   form.value.menu[index].price = Math.max(0, (Number(form.value.menu[index].price) || 0) - amount)
  // }
</script>

<style scoped>
/* 隱藏瀏覽器的數字輸入清除按鈕和上下箭頭 */
/* input[type=number]::-webkit-clear-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
} */
/* Firefox */

/* *{
  background-color: #fff;
} */
</style>

<template>
  <v-container>
    <v-file-input
      accept=".xlsx, .xls"
      label="匯入菜單 Excel 檔案"
      @change="onExcelUpload"
    />

    <v-btn
      color="primary"
      :disabled="menus.length === 0"
      style="z-index: 9999; position: relative; background-color: #ff4081;"
      @click="submitMenus"
    >
      匯入菜單
    </v-btn>

    <v-alert
      v-if="error"
      dense
      type="error"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-if="success"
      dense
      type="success"
    >
      {{ success }}
    </v-alert>

    <div v-if="menus.length > 0">
      <h3>預覽匯入資料</h3>
      <v-simple-table>
        <thead>
          <tr>
            <th>項目</th>
            <th>價格</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(menu, index) in menus" :key="index">
            <td>{{ menu.name }}</td>
            <td>{{ menu.price }}</td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>
  </v-container>
</template>

<script>
  import * as XLSX from 'xlsx'

  export default {
    data () {
      return {
        menus: [],
        error: '',
        success: '',
      }
    },
    methods: {
      onExcelUpload (files) {
        this.error = ''
        this.success = ''
        this.menus = []

        if (files.length === 0) return
        const file = files[0]
        const reader = new FileReader()

        reader.addEventListener('load', e => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(firstSheet)

            // 假設Excel欄位是「項目」跟「價格」
            this.menus = jsonData.map(item => ({
              name: item['項目'] || '',
              price: Number(item['價格']) || 0,
            })).filter(item => item.name && item.price > 0)

            if (this.menus.length === 0) {
              this.error = 'Excel 資料格式不正確或沒有有效菜單項目'
            }
          } catch (error) {
            this.error = '讀取 Excel 發生錯誤'
            console.error(error)
          }
        })
        // eslint-disable-next-line
        reader.readAsArrayBuffer(file)
      },

      async submitMenus () {
        try {
          this.error = ''
          this.success = ''
          // 假設你後端API是 /restaurants/:id/menus/bulkImport
          const restaurantId = this.$route.params.id
          const res = await fetch(`/restaurants/${restaurantId}/menus/bulkImport`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`, // 依照你存token方式調整
            },
            body: JSON.stringify({ menus: this.menus }),
          })

          const data = await res.json()
          if (res.ok) {
            this.success = '匯入成功！'
            this.menus = []
          } else {
            this.error = data.message || '匯入失敗'
          }
        } catch (error) {
          this.error = '伺服器錯誤，請稍後再試'
          console.error(error)
        }
      },
    },
  }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">菜單管理</h1>
      </v-col>
      <v-divider />
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="menus"
          :search="search"
        >
          <template #top>
            <v-toolbar>
              <v-btn variant="outlined" @click="openDialog(null)">新增菜單</v-btn>
              <v-spacer />
              <v-text-field
                v-model="search"
                density="compact"
                hide-details
                placeholder="搜尋菜單"
                prepend-inner-icon="mdi-magnify"
                variant="solo"
              />
            </v-toolbar>
          </template>
          <template #[`item.image`]="{ value }">
            <v-img :src="value" width="75" />
          </template>
          <template #[`item.restaurant.name`]="{ item }">
            {{ item.restaurant?.name || '未指定' }}
          </template>
          <template #[`item.action`]="{ item }">
            <v-btn icon="mdi-pencil" variant="text" @click="openDialog(item)" />
            <v-btn
              v-if="!item.isDeleted"
              color="red"
              icon="mdi-delete"
              variant="text"
              @click="softDeleteMenu(item._id)"
            />
            <v-btn
              v-else
              color="green"
              icon="mdi-restore"
              variant="text"
              @click="restoreMenu(item._id)"
            />
          </template>
          <template #[`item.isDeleted`]="{ item }">
            <v-chip :color="item.isDeleted ? 'red' : 'green'" dark>
              {{ item.isDeleted ? '已刪除' : '正常' }}
            </v-chip>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- 菜單表單 Dialog -->
    <v-dialog v-model="dialog.open" persistent width="700">
      <v-form :disabled="isSubmitting" @submit.prevent="submit">
        <v-card>
          <v-card-title>{{ dialog.id ? '編輯菜單' : '新增菜單' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="name.value.value" :error-messages="name.errorMessage.value" label="名稱" />
            <v-text-field v-model="price.value.value" :error-messages="price.errorMessage.value" label="價格" type="number" />
            <v-text-field v-model="image.value.value" :error-messages="image.errorMessage.value" label="圖片網址" />
            <v-text-field v-model="tags.value.value" label="標籤（逗號分隔）" />
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
  import { ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import * as yup from 'yup'
  import menuService from '@/services/menu'

  const createSnackbar = useSnackbar()
  const menus = ref([])
  const search = ref('')
  const headers = [
    { title: '圖片', key: 'image', sortable: false },
    { title: '餐廳', key: 'restaurant.name' },
    { title: '名稱', key: 'name' },
    { title: '價格', key: 'price' },
    { title: '標籤', key: 'tags' },
    { title: '狀態', value: 'isDeleted' },
    { title: '操作', key: 'action', sortable: false },
  ]

  const getMenus = async () => {
    try {
      // 這裡假設你有一個取得全部菜單的 API
      // 若沒有請自行補上
      // const { data } = await menuService.getAll()
      // menus.value = data.menus
      // 目前只提供單一菜單查詢，請依需求補上

      const { data } = await menuService.getAll()
      console.log('前端/pages/admin/menu.js getMenus API回傳', data)
      menus.value = data.data // 注意這裡是 data.data
    } catch {
      createSnackbar({ text: '無法載入菜單資料', snackbarProps: { color: 'red' } })
    }
  }
  getMenus()

  const dialog = ref({ open: false, id: '' })
  const openDialog = item => {
    if (item) {
      dialog.value.id = item._id
      name.value.value = item.name
      price.value.value = item.price
      image.value.value = item.image
      tags.value.value = item.tags?.join(',') || ''
    }
    dialog.value.open = true
  }
  const closeDialog = () => {
    dialog.value.open = false
    dialog.value.id = ''
    resetForm()
  }

  const { handleSubmit, resetForm, isSubmitting } = useForm({
    validationSchema: yup.object({
      name: yup.string().required('菜單名稱必須填寫').max(100),
      price: yup.number().required('價格必須填寫').min(0),
      image: yup.string().url('請輸入有效網址').max(200),
      tags: yup.string(),
    }),
    initialValues: {
      name: '',
      price: 0,
      image: '',
      tags: '',
    },
  })

  const name = useField('name')
  const price = useField('price')
  const image = useField('image')
  const tags = useField('tags')

  const submit = handleSubmit(async values => {
    try {
      const payload = {
        name: values.name,
        price: values.price,
        image: values.image,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()) : [],
      }
      await (dialog.value.id.length === 0 ? menuService.create(payload) : menuService.updateMenu(dialog.value.id, payload))
      createSnackbar({ text: '操作成功！', snackbarProps: { color: 'green' } })
      closeDialog()
      getMenus()
    } catch (error) {
      createSnackbar({ text: error?.response?.data?.message || '操作失敗', snackbarProps: { color: 'red' } })
    }
  })

  const softDeleteMenu = async id => {
    try {
      await menuService.updateMenu(id, { isDeleted: true })
      createSnackbar({ text: '菜單已軟刪除', snackbarProps: { color: 'orange' } })
      getMenus()
    } catch (error) {
      createSnackbar({ text: error?.response?.data?.message || '操作失敗', snackbarProps: { color: 'red' } })
    }
  }
  const restoreMenu = async id => {
    try {
      await menuService.updateMenu(id, { isDeleted: false })
      createSnackbar({ text: '菜單已還原', snackbarProps: { color: 'green' } })
      getMenus()
    } catch (error) {
      createSnackbar({ text: error?.response?.data?.message || '操作失敗', snackbarProps: { color: 'red' } })
    }
  }

  onMounted(getMenus)
</script>

<route lang="yaml">
meta:
  layout: admin
  title: 菜單管理
  login: login-only
  admin: true
</route>

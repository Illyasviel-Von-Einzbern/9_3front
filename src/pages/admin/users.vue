<template>
  <v-container>
    <v-col cols="12">
      <h1 class="text-center">使用者管理</h1>
    </v-col>
    <!-- <h1 class="text-h5 mb-4">使用者管理</h1> -->

    <!-- 新增使用者區塊 -->
    <v-card class="pa-4 mb-6">
      <v-card-title>管理員新增使用者</v-card-title>
      <v-form ref="formRef" @submit.prevent="handleCreateUser">
        <v-row>
          <v-col cols="12" md="4" sm="6">
            <v-text-field
              v-model="form.account"
              clearable
              label="帳號"
              required
            />
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-text-field
              v-model="form.password"
              clearable
              label="密碼"
              required
              type="password"
            />
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-text-field
              v-model="form.grade"
              clearable
              label="年級"
              required
            />
          </v-col>
          <v-col cols="12" md="4" sm="6">
            <v-select
              v-model="form.role"
              clearable
              :items="roles"
              label="身分"
              required
            />
          </v-col>
          <v-col class="d-flex align-center" cols="12" md="4" sm="6">
            <v-checkbox
              v-model="form.isBlocked"
              class="me-4"
              label="封鎖"
            />
            <v-checkbox
              v-model="form.isDeleted"
              label="刪除（軟刪除）"
            />
          </v-col>
          <v-col class="d-flex align-center" cols="12" md="4" sm="6">
            <v-btn color="primary" :disabled="creatingUser" :loading="creatingUser" type="submit">
              新增使用者
            </v-btn>
          </v-col>
        </v-row>

        <v-alert
          v-if="createError"
          class="mt-3"
          dense
          dismissible
          type="error"
          @click:close="createError = null"
        >
          {{ createError }}
        </v-alert>
      </v-form>
    </v-card>

    <!-- 搜尋欄 -->
    <v-text-field
      v-model="search"
      class="mb-4"
      clearable
      label="搜尋帳號"
      prepend-icon="mdi-magnify"
    />

    <!-- 使用者表格 -->
    <v-data-table
      class="elevation-1"
      :headers="headers"
      item-key="id"
      :items="filteredUsers"
      :loading="loading"
      :sort-by="[{ key: 'account', order: 'asc' }]"
    >
      <!-- 建立時間欄格式化 -->
      <!-- eslint-disable-next-line -->
      <template #item.createdAt="{ item }">
        {{ formatDate(item.createdAt) }}
      </template>

      <!-- 封鎖狀態 -->
      <!-- eslint-disable-next-line -->
      <template #item.isBlocked="{ item }">
        <v-chip :color="item.isBlocked ? 'red' : 'green'" dark>
          {{ item.isBlocked ? '是' : '否' }}
        </v-chip>
      </template>

      <!-- 軟刪除狀態 -->
      <!-- eslint-disable-next-line -->
      <template #item.isDeleted="{ item }">
        <v-chip :color="item.isDeleted ? 'red' : 'green'" dark>
          {{ item.isDeleted ? '是' : '否' }}
        </v-chip>
      </template>

      <!-- 操作欄 -->
      <!-- eslint-disable-next-line -->
      <template #item.actions="{ item }">
        <v-btn color="blue" icon @click="openEdit(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>

        <v-btn
          class="me-2"
          :color="item.isBlocked ? 'success' : 'error'"
          :disabled="item._id === currentUserId"
          small
          :title="item.isBlocked ? '解除封鎖' : '封鎖'"
          @click="toggleUserFlag(item._id, 'isBlocked', item.isBlocked)"
        >
          {{ item.isBlocked ? '解除封鎖' : '封鎖' }}
        </v-btn>

        <v-btn
          class="me-2"
          :color="item.isDeleted ? 'success' : 'error'"
          :disabled="item._id === currentUserId"
          small
          :title="item.isDeleted ? '復原' : '刪除（軟刪除）'"
          @click="toggleUserFlag(item._id, 'isDeleted', item.isDeleted)"
        >
          {{ item.isDeleted ? '復原' : '刪除' }}
        </v-btn>

        <v-btn
          color="red"
          :disabled="item._id === currentUserId"
          icon
          title="永久刪除"
          @click="deleteUser(item._id)"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- 編輯使用者 Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>編輯使用者</v-card-title>
        <v-card-text>
          <v-text-field v-model="editingUser.account" disabled label="帳號" />
          <v-text-field v-model="editingUser.grade" label="年級" />
          <v-select
            v-model="editingUser.role"
            :items="['user', 'admin']"
            label="身分"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="dialog = false">取消</v-btn>
          <!-- <v-btn color="primary" @click="saveUser">保存</v-btn> -->
          <v-btn color="primary" :disabled="savingUser" :loading="savingUser" @click="saveUser">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 使用者總數 -->
    <div class="text-caption mt-2 text-right">
      共 {{ filteredUsers.length }} 位使用者
    </div>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import userService from '@/services/user'

  // Snackbar 通知
  const createSnackbar = useSnackbar()

  // 狀態
  const users = ref([])
  const search = ref('')
  const loading = ref(false)
  const currentUserId = ref('')
  const editingUser = ref(null) // 編輯中使用者
  const dialog = ref(false)

  const form = ref({
    account: '',
    password: '',
    grade: '',
    role: 'user',
    isBlocked: false,
    isDeleted: false,
  })

  const roles = ['user', 'admin']

  const headers = [
    { title: '帳號', value: 'account' },
    { title: '年級', value: 'grade' },
    { title: '身分', value: 'role' },
    { title: '封鎖', value: 'isBlocked' },
    { title: '刪除', value: 'isDeleted' },
    { title: '建立時間', value: 'createdAt' },
    { title: '操作', value: 'actions', sortable: false },
  ]

  const createError = ref(null)
  const creatingUser = ref(false)
  const savingUser = ref(false)

  // 取得目前登入者的資料
  const fetchProfile = async () => {
    try {
      const res = await userService.profile()
      currentUserId.value = res.data.user._id
    } catch {
      createSnackbar({ text: '無法取得登入資訊', snackbarProps: { color: 'red' } })
    }
  }

  // 取得所有使用者
  const fetchUsers = async () => {
    loading.value = true
    try {
      const res = await userService.getAll() // 假設這是 GET /users
      console.log('取得的資料', res.data) // ✅ 這裡會幫你看有沒有資料
      users.value = res.data.result
    } catch {
      createSnackbar({ text: '無法取得使用者資料', snackbarProps: { color: 'red' } })
      console.error('fetchUsers error:', error)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await fetchProfile()
    await fetchUsers()
  })

  // 新增使用者
  const handleCreateUser = async () => {
    createError.value = null

    if (!form.value.account || !form.value.password || !form.value.grade) {
      createError.value = '帳號、密碼及年級為必填欄位'
      return
    }

    creatingUser.value = true
    try {
      const res = await userService.adminCreate(form.value)
      if (res.data.success) {
        createSnackbar({ text: '新增成功', snackbarProps: { color: 'green' } })
        // 清空表單
        form.value = {
          account: '',
          password: '',
          grade: '',
          role: 'user',
          isBlocked: false,
          isDeleted: false,
        }
        await fetchUsers()
      } else {
        createError.value = res.data.message || '新增失敗'
      }
    } catch (error) {
      console.error(error) // 印出錯誤，方便除錯
      createError.value = '伺服器錯誤'
    } finally {
      creatingUser.value = false
    }
  }

  // 刪除使用者
  const deleteUser = async id => {
    if (id === currentUserId.value) {
      createSnackbar({ text: '不能刪除自己', snackbarProps: { color: 'orange' } })
      return
    }
    if (!confirm('確定要刪除這位使用者嗎？')) return
    try {
      await userService.delete(id) // 假設這是 DELETE /users/:id
      createSnackbar({ text: '刪除成功', snackbarProps: { color: 'green' } })
      await fetchUsers()
    } catch {
      createSnackbar({ text: '刪除失敗', snackbarProps: { color: 'red' } })
    }
  }

  // 開啟編輯對話框
  const openEdit = user => {
    editingUser.value = { ...user } // 深拷貝，避免直接綁定
    dialog.value = true
  }

  // 保存編輯
  const saveUser = async () => {
    try {
      await userService.update(editingUser.value._id, editingUser.value)
      createSnackbar({ text: '更新成功', snackbarProps: { color: 'green' } })
      dialog.value = false
      await fetchUsers()
    } catch {
      createSnackbar({ text: '更新失敗', snackbarProps: { color: 'red' } })
    } finally {
      savingUser.value = false
    }
  }

  // 封鎖 / 軟刪除切換
  const toggleUserFlag = async (id, field, current) => {
    if (id === currentUserId.value) {
      createSnackbar({ text: '不能操作自己', snackbarProps: { color: 'orange' } })
      return
    }
    try {
      const payload = { [field]: !current }
      const res = await userService.update(id, payload)
      if (res.data.success) {
        createSnackbar({ text: `${field === 'isBlocked' ? '封鎖' : '刪除'}狀態已更新`, snackbarProps: { color: 'green' } })
        // createSnackbar({ text: '狀態已更新', snackbarProps: { color: 'green' } })
        await fetchUsers()
      } else {
        createSnackbar({ text: res.data.message || '更新失敗', snackbarProps: { color: 'red' } })
      }
    } catch (error) {
      console.error(error) // 印出錯誤，方便除錯
      createSnackbar({ text: '伺服器錯誤', snackbarProps: { color: 'red' } })
    }
  }

  // 搜尋過濾
  const filteredUsers = computed(() => {
    return users.value.filter(user =>
      user.account.toLowerCase().includes(search.value.toLowerCase()),
    )
  })

  // 建立時間格式化
  const formatDate = dateStr => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString()
  }

  onMounted(fetchUsers)
</script>

<route lang="yaml">
meta:
  layout: 'admin'
  title: '使用者管理'
  login: 'login-only'
  admin: true
</route>

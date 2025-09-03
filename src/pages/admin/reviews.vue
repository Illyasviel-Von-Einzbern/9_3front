<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h1 class="text-center">評論管理</h1>
      </v-col>

      <v-col class="d-flex align-center mb-4" cols="12" gap="16">
        <v-text-field
          v-model="search"
          density="compact"
          hide-details
          placeholder="搜尋評論 / 評論者 / 餐廳"
          prepend-inner-icon="mdi-magnify"
          style="max-width: 350px"
          variant="solo"
        />

        <v-select
          v-model="filter"
          clearable
          dense
          item-title="text"
          item-value="value"
          :items="filterOptions"
          label="篩選"
          style="max-width: 150px"
        />

        <v-select
          v-model="selectedRestaurantId"
          clearable
          dense
          item-title="text"
          item-value="value"
          :items="restaurantOptions"
          label="篩選餐廳"
          style="max-width: 200px"
        />

        <v-btn
          color="error"
          :disabled="selectedReviews.length === 0"
          @click="batchDelete"
        >
          批次刪除
        </v-btn>
      </v-col>

      <v-col cols="12">
        <!-- eslint-disable -->
        <v-data-table
          v-model:selected="selectedReviews"
          class="elevation-1"
          :headers="headers"
          item-key="_id"
          :items="filteredReviews"
          :search="search"
          show-select
        >
        <!-- eslint-enable -->
          <template #top>
            <v-toolbar flat />
          </template>

          <template #[`item.content`]="{ item }">
            <div>
              <span v-html="highlightText(truncatedContent(item.content, item._id), search)" />
              <v-btn
                v-if="item.content.length > 100"
                small
                text
                @click="toggleExpand(item._id)"
              >
                {{ expandedIds.has(item._id) ? '收合' : '展開' }}
              </v-btn>
            </div>
          </template>

          <template #[`item.score`]="{ value }">
            <v-rating dense :model-value="value" readonly size="small" />
          </template>

          <template #[`item.user.account`]="{ item }">
            <span v-html="highlightText(item.user.account || '匿名', search)" />
          </template>

          <template #[`item.restaurant.name`]="{ item }">
            <span v-html="highlightText(item.restaurant.name, search)" />
          </template>

          <template #[`item.createdAt`]="{ item }">
            {{ new Date(item.createdAt).toLocaleString() }}
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
            <v-btn color="blue" icon @click="openEdit(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              class="me-2"
              :color="item.isDeleted ? 'success' : 'error'"
              small
              :title="item.isDeleted ? '恢復' : '軟刪除'"
              @click="toggleReviewFlag(item._id, item.isDeleted)"
            >
              {{ item.isDeleted ? '恢復' : '軟刪除' }}
            </v-btn>
            <v-btn
              color="red"
              icon
              title="永久刪除"
              @click="hardDeleteReview(item._id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>

      <!-- 編輯評論對話框 -->
      <v-dialog v-model="editDialog" max-width="500">
        <v-card>
          <v-card-title>編輯評論</v-card-title>
          <v-card-text>
            <v-text-field v-model="editingReview.content" label="評論內容" />
            <v-rating v-model="editingReview.score" label="評分" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click="editDialog = false">取消</v-btn>
            <v-btn color="primary" :loading="savingReview" @click="saveReview">保存</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { useSnackbar } from 'vuetify-use-dialog'
  import restaurantService from '@/services/restaurant'
  import reviewService from '@/services/review'

  const createSnackbar = useSnackbar()

  // 原始評論列表
  const reviews = ref([])

  // 搜尋關鍵字
  const search = ref('')

  // 篩選狀態選項
  const filterOptions = [
    { text: '全部', value: null },
    { text: '匿名評論', value: 'anonymous' },
    { text: '已刪除', value: 'deleted' },
  ]
  const filter = ref(null)

  // 餐廳列表
  const restaurantOptions = ref([])
  const selectedRestaurantId = ref(null)

  // 多選勾選的評論ID
  const selectedReviews = ref([])

  // 評論內容展開的ID集合
  const expandedIds = ref(new Set())

  // 表格欄位設定
  const headers = [
    { title: '評論內容', key: 'content' },
    { title: '評分', key: 'score' },
    { title: '評論者', key: 'user.account' },
    { title: '餐廳', key: 'restaurant.name' },
    { title: '時間', key: 'createdAt' },
    { title: '狀態', key: 'isDeleted' },
    { title: '操作', key: 'action', sortable: false },
  ]

  // 取得餐廳列表
  const fetchRestaurants = async () => {
    try {
      const { data } = await restaurantService.getAll()
      restaurantOptions.value = data?.result?.map(r => ({ text: r.name, value: r._id })) || []
    } catch {
      createSnackbar({ text: '無法取得餐廳列表', snackbarProps: { color: 'red' } })
    }
  }

  // 取得全部評論
  const fetchReviews = async () => {
    try {
      const { data } = await reviewService.getAllAdmin() // 你需要有這個 API
      // reviews.value = data?.data || []
      console.log('API回傳資料:', data) // <== 這一行是新增的，幫你印出 API 回傳資料
      reviews.value = data?.result || [] // 這裡改成 data.result（因為你的 API 是回傳 result）
      console.log('reviews', reviews.value)
    } catch {
      createSnackbar({ text: '無法取得評論列表', snackbarProps: { color: 'red' } })
    }
  }

  // 篩選後的評論清單（含搜尋、篩選、餐廳過濾）
  const filteredReviews = computed(() => {
    let filtered = [...reviews.value]

    if (filter.value === 'anonymous') {
      filtered = filtered.filter(r => r.isAnonymous)
    } else if (filter.value === 'deleted') {
      filtered = filtered.filter(r => r.isDeleted)
    }

    if (selectedRestaurantId.value) {
      // filtered = filtered.filter(r => r.restaurant._id === selectedRestaurantId.value)
      filtered = filtered.filter(r => String(r.restaurant._id) === String(selectedRestaurantId.value))
    }

    if (search.value) {
      const keyword = search.value.toLowerCase()
      filtered = filtered.filter(r => {
        return (
          (r.content && r.content.toLowerCase().includes(keyword))
          || (r.user?.account && r.user.account.toLowerCase().includes(keyword))
          || (r.restaurant?.name && r.restaurant.name.toLowerCase().includes(keyword))
        )
      })
    }

    return filtered
  })

  // 刪除單筆評論
  // const deleteReview = async id => {
  //   try {
  //     await reviewService.delete(id)
  //     createSnackbar({ text: '刪除成功', snackbarProps: { color: 'green' } })
  //     selectedReviews.value = selectedReviews.value.filter(v => v !== id)
  //     await fetchReviews()
  //   } catch {
  //     createSnackbar({ text: '刪除失敗', snackbarProps: { color: 'red' } })
  //   }
  // }

  // 恢復單筆評論
  // const restoreReview = async id => {
  //   try {
  //     await reviewService.restore(id)
  //     createSnackbar({ text: '恢復成功', snackbarProps: { color: 'green' } })
  //     fetchReviews()
  //   } catch {
  //     createSnackbar({ text: '恢復失敗', snackbarProps: { color: 'red' } })
  //   }
  // }

  // 多筆批次刪除
  const batchDelete = async () => {
    if (selectedReviews.value.length === 0) return
    try {
      await Promise.all(selectedReviews.value.map(id => reviewService.delete(id)))
      createSnackbar({ text: '批次刪除成功', snackbarProps: { color: 'green' } })
      selectedReviews.value = []
      await fetchReviews()
    } catch {
      createSnackbar({ text: '批次刪除失敗', snackbarProps: { color: 'red' } })
    }
  }

  // 展開/收合評論內容
  const toggleExpand = id => {
    if (expandedIds.value.has(id)) {
      expandedIds.value.delete(id)
    } else {
      expandedIds.value.add(id)
    }
  }

  // 評論內容摘要
  const truncatedContent = (content, id) => {
    if (expandedIds.value.has(id)) return content
    return content.length > 100 ? content.slice(0, 100) + '...' : content
  }

  // 搜尋關鍵字高亮
  const highlightText = (text, keyword) => {
    if (!keyword) return text
    const escaped = keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, String.raw`\$&`)
    const regex = new RegExp(`(${escaped})`, 'gi')
    return text.replace(regex, '<span style="background-color: yellow;">$1</span>')
  }

  // 編輯評論對話框
  const editDialog = ref(false)
  const editingReview = ref({ content: '', score: 0 })
  const savingReview = ref(false)

  // 開啟編輯對話框
  const openEdit = review => {
    editingReview.value = { ...review }
    editDialog.value = true
  }

  // 保存評論
  const saveReview = async () => {
    savingReview.value = true
    try {
      await reviewService.update(editingReview.value._id, {
        content: editingReview.value.content,
        score: editingReview.value.score,
      })
      createSnackbar({ text: '更新成功', snackbarProps: { color: 'green' } })
      editDialog.value = false
      await fetchReviews()
    } catch {
      createSnackbar({ text: '更新失敗', snackbarProps: { color: 'red' } })
    } finally {
      savingReview.value = false
    }
  }

  // 軟刪除/恢復
  // const toggleReviewFlag = async (id, isDeleted) => {
  //   const review = reviews.value.find(r => r._id === id)
  //   if (!review) return
  //   try {
  //     await reviewService.update(id, {
  //       content: review.content,
  //       score: review.score,
  //       isDeleted: !isDeleted,
  //     })
  //     createSnackbar({ text: isDeleted ? '已恢復' : '已軟刪除', snackbarProps: { color: isDeleted ? 'green' : 'orange' } })
  //     await fetchReviews()
  //   } catch {
  //     createSnackbar({ text: '操作失敗', snackbarProps: { color: 'red' } })
  //   }
  // }

  // 軟刪除
  const softDeleteReview = async id => {
    try {
      await reviewService.softDelete(id)
      createSnackbar({ text: '已軟刪除', snackbarProps: { color: 'orange' } })
      await fetchReviews()
    } catch {
      createSnackbar({ text: '操作失敗', snackbarProps: { color: 'red' } })
    }
  }

  // 還原
  const restoreReview = async id => {
    try {
      await reviewService.restore(id)
      createSnackbar({ text: '已恢復', snackbarProps: { color: 'green' } })
      await fetchReviews()
    } catch {
      createSnackbar({ text: '操作失敗', snackbarProps: { color: 'red' } })
    }
  }

  // 操作按鈕
  const toggleReviewFlag = async (id, isDeleted) => {
    await (isDeleted ? restoreReview(id) : softDeleteReview(id))
  }

  // 硬刪除
  const hardDeleteReview = async id => {
    if (!confirm('確定要永久刪除這則評論嗎？')) return
    try {
      await reviewService.delete(id)
      createSnackbar({ text: '已永久刪除', snackbarProps: { color: 'red' } })
      await fetchReviews()
    } catch {
      createSnackbar({ text: '刪除失敗', snackbarProps: { color: 'red' } })
    }
  }

  // 頁面掛載時，取得資料
  onMounted(() => {
    fetchReviews()
    fetchRestaurants()
  })
</script>

<route lang="yaml">
meta:
  layout: 'admin'
  title: '評論管理'
  login: 'login-only'
  admin: true
</route>

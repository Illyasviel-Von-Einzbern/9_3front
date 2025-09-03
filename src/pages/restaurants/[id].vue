<template>
  <v-container>
    <v-row>
      <v-col class="d-flex justify-space-between align-center" cols="12">
        <v-btn prepend-icon="mdi-arrow-left" to="/">返回列表</v-btn>
        <v-btn
          v-if="restaurant && user.isLoggedIn"
          color="primary"
          prepend-icon="mdi-pencil"
          :to="`/restaurants/edit/${restaurant._id}`"
        >
          編輯餐廳
        </v-btn>
      </v-col>
      <!-- Loading and Error States -->
      <v-col v-if="loading" class="text-center" cols="12">
        <v-progress-circular color="primary" indeterminate />
      </v-col>
      <v-col v-else-if="restaurant" cols="12">
        <v-card>
          <v-img
            cover
            height="500px"
            :src="restaurant.image"
          />

          <v-card-text>
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="text-h5 font-weight-bold">{{ restaurant.name }}</div>
              <v-chip color="primary" size="small" variant="outlined">
                {{ restaurant.category || '未分類' }}
              </v-chip>
            </div>

            <div class="d-flex align-center mb-4">
              <StarRating :score="restaurant.average_score" />
              <span class="ml-2 text-body-1">{{ restaurant.average_score.toFixed(1) }}</span>
            </div>

            <p><strong>電話：</strong> {{ restaurant.phone }}</p>
            <p><strong>地址：</strong> {{ restaurant.address }}</p>
            <p v-if="restaurant.link">
              <strong>相關連結：</strong>
              <a
                class="d-inline-flex align-center"
                :href="processedLink"
                rel="noopener noreferrer"
                style="text-decoration: none; color: inherit;"
                target="_blank"
              >
                <v-icon class="mr-1" :icon="linkIcon" size="small" />
                {{ linkText }}
              </a>
            </p>
            <p><strong>營業時間：</strong></p>
            <BusinessHours :hours="restaurant.business_hours" />
          </v-card-text>

          <v-divider />

          <!-- 整份菜單圖片 -->
          <template v-if="restaurant.menuImage">
            <v-card-title>店家菜單</v-card-title>
            <v-img class="mx-4 mb-4" max-height="600" :src="restaurant.menuImage" style="border: 1px solid #eee; border-radius: 4px;" />
            <v-divider />
          </template>

          <v-card-title>餐點介紹</v-card-title>
          <v-list v-if="restaurant.menu && restaurant.menu.length > 0">
            <!-- eslint-disable-next-line -->
            <template v-for="(item, index) in restaurant.menu" :key="item._id">
              <v-list-item>
                <template #prepend>
                  <v-avatar class="mr-4" rounded="lg">
                    <v-img v-if="item.image" :alt="item.name" cover :src="item.image" />
                    <v-icon v-else>mdi-food-outline</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.name }}</v-list-item-title>
                <v-list-item-subtitle>${{ item.price }}</v-list-item-subtitle>
                <template #append>
                  <v-btn
                    color="primary"
                    size="small"
                    variant="tonal"
                    @click="openAddToCartDialog(item)"
                  >加入訂單</v-btn>
                </template>
              </v-list-item>
              <v-divider v-if="index < restaurant.menu.length - 1" />
            </template>
          </v-list>
          <v-card-text v-else>
            店家尚未提供菜單
          </v-card-text>

          <v-divider />

          <!-- <v-card-title>評論 ({{ restaurant.review_count }})</v-card-title>
          <v-list v-if="restaurant.reviews && restaurant.reviews.length > 0">
            <template v-for="(review, index) in restaurant.reviews" :key="review._id">
              <v-list-item>
                <v-list-item-title>{{ review.user.account }}</v-list-item-title>
                <v-list-item-subtitle>{{ review.content }}</v-list-item-subtitle>
                <template #append>
                  <v-rating
                    color="amber"
                    density="compact"
                    half-increments
                    :model-value="review.score"
                    readonly
                  />
                </template>
              </v-list-item>
              <v-divider v-if="index < restaurant.reviews.length - 1" />
            </template>
          </v-list>
          <v-card-text v-else>
            尚無評論
          </v-card-text> -->
          <!-- <v-card-title>評論 ({{ reviews.length }})</v-card-title>

          <v-list v-if="reviews.length > 0" style="overflow-x: hidden;">
            <template v-for="(review, index) in reviews" :key="review._id">
              <v-list-item>
                <v-list-item-title>
                  {{ review.isAnonymous ? '匿名使用者' : review.user?.account }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ review.content }}
                </v-list-item-subtitle>
                <template #append>
                  <v-rating
                    color="amber"
                    density="compact"
                    half-increments
                    :model-value="review.score"
                    readonly
                  />
                </template>
              </v-list-item>
              <v-divider v-if="index < reviews.length - 1" />
            </template>
          </v-list>

          <v-card-text v-else>
            尚無評論
          </v-card-text> -->

          <v-list v-if="reviews.length > 0" style="overflow-x: hidden;">
            <!-- eslint-disable-next-line -->
            <template v-for="(review, index) in reviews" :key="review._id">
              <v-list-item>
                <v-row align="center" class="w-100" no-gutters>
                  <!-- 左側：使用者名稱 + 日期時間 -->
                  <v-col cols="7">
                    <div class="d-flex align-center" style="font-size: 0.9rem; color: #fff;">
                      <span class="font-weight-medium">
                        {{ review.isAnonymous ? '匿名使用者' : review.user?.account || '使用者' }}
                      </span>
                      <!-- <span class="mx-2">·</span> -->
                      <!-- <span class="mx-2">&nbsp;</span> -->
                      <span><!-- -->　　</span>
                      <span>
                        <!-- {{ new Date(review.createdAt).toLocaleString(undefined, { hour12: false }) }} -->
                        {{ formatDate24(review.createdAt) }}
                      </span>
                      <!-- 新增：軟刪除標示 -->
                      <v-chip
                        v-if="review.isDeleted"
                        class="ml-2"
                        color="error"
                        size="x-small"
                        variant="outlined"
                      >
                        已刪除
                      </v-chip>
                    </div>
                    <!-- 評論內容 -->
                    <div style="font-size: 1rem; margin-top: 4px;">
                      {{ review.content }}
                    </div>
                  </v-col>

                  <!-- 右側：星星評分 -->
                  <v-col class="d-flex justify-end" cols="5">
                    <v-rating
                      color="amber"
                      density="compact"
                      half-increments
                      :model-value="review.score"
                      readonly
                    />
                  </v-col>
                </v-row>
              </v-list-item>
              <v-divider v-if="index < reviews.length - 1" />
            </template>
          </v-list>

        </v-card>
      </v-col>
      <v-col v-else class="text-center" cols="12">
        <h2>找不到餐廳</h2>
        <p>您要找的餐廳可能不存在或已被移除。</p>
      </v-col>
    </v-row>

    <!-- 添加到購物車的對話框 -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card v-if="selectedItem">
        <v-card-title>
          <span class="text-h5">{{ selectedItem.name }}</span>
        </v-card-title>
        <v-card-text>
          <p>價格: ${{ selectedItem.price }}</p>
          <v-text-field
            v-model.number="quantity"
            class="mt-4"
            density="compact"
            hide-details
            label="數量"
            min="1"
            type="number"
            variant="outlined"
          />
          <!-- 您可以在這裡添加更多選項，例如備註或客製化選項 -->
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="blue-darken-1" text @click="dialog = false">取消</v-btn>
          <v-btn color="blue-darken-1" variant="tonal" @click="confirmAddToCart">確認加入</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 新增評論區塊 -->
    <v-divider class="my-8" />

    <v-card class="pa-4" elevation="2">
      <v-card-title>📝 我要留言</v-card-title>
      <v-card-text>
        <v-textarea
          v-model="newReview.content"
          auto-grow
          clearable
          counter="300"
          label="評論內容"
          rows="3"
          :rules="[v => !!v || '請輸入評論內容']"
        />

        <v-rating
          v-model="newReview.score"
          background-color="grey lighten-1"
          class="mt-2"
          color="amber"
          label="評分"
          large
          length="5"
        />

        <v-checkbox
          v-model="newReview.isAnonymous"
          class="mt-2"
          label="匿名留言"
        />

        <!-- <v-btn class="mt-4" color="primary" @click="submitReview">
          送出評論
        </v-btn> -->
        <v-btn class="mt-4" color="primary" @click="submitReview">
          {{ editingReviewId ? '修改評論' : '送出評論' }}
        </v-btn>
      </v-card-text>
    </v-card>

  </v-container>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSnackbar } from 'vuetify-use-dialog'
  import BusinessHours from '@/components/BusinessHours.vue'
  import StarRating from '@/components/StarRating.vue'
  import apiService from '@/services/api.js'
  import reviewService from '@/services/review.js'
  import { useCartStore } from '@/stores/cart'
  import { useUserStore } from '@/stores/user'

  const route = useRoute()
  const router = useRouter()
  const createSnackbar = useSnackbar()
  const cart = useCartStore()

  const user = useUserStore()
  const restaurant = ref(null)
  const loading = ref(true)

  // Dialog state
  const dialog = ref(false)
  const selectedItem = ref(null)
  const quantity = ref(1)

  const openAddToCartDialog = item => {
    selectedItem.value = { ...item }
    quantity.value = 1 // 重設數量
    dialog.value = true
  }

  const confirmAddToCart = async () => {
    if (!selectedItem.value || quantity.value <= 0) return

    const success = await cart.addItem({
      ...selectedItem.value,
      quantity: quantity.value,
      restaurantId: restaurant.value._id,
    })

    dialog.value = false

    if (success) {
      // 根據您的要求，在成功加入後跳轉到訂單頁面
      router.push('/orders')
    }
  }

  const processedLink = computed(() => {
    if (!restaurant.value?.link) return '#'

    const link = restaurant.value.link
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return link
    }
    // 如果沒有協議頭，預設加上 https://
    return `https://${link}`
  })

  const linkText = computed(() => {
    if (!restaurant.value?.link) return ''
    const url = restaurant.value.link.toLowerCase()
    if (url.includes('google.com/maps')) return 'Google 地圖'
    if (url.includes('facebook.com')) return 'Facebook'
    if (url.includes('instagram.com')) return 'Instagram'
    if (url.includes('line.me')) return 'Line'
    // 可以繼續添加其他常用網站
    return '官方網站'
  })

  const linkIcon = computed(() => {
    if (!restaurant.value?.link) return null
    const url = restaurant.value.link.toLowerCase()
    if (url.includes('google.com/maps')) return 'mdi-google-maps'
    if (url.includes('facebook.com')) return 'mdi-facebook'
    if (url.includes('instagram.com')) return 'mdi-instagram'
    if (url.includes('line.me')) return 'mdi-chat'
    // 預設圖示
    return 'mdi-link-variant'
  })

  const loadRestaurant = async () => {
    loading.value = true
    try {
      const { data } = await apiService.apiAuth.get('/restaurants/' + route.params.id)
      restaurant.value = data.data
      console.log(reviews)
    } catch (error) {
      console.error('無法載入餐廳資料', error)
      createSnackbar({
        text: error.response?.data?.message || '無法載入餐廳資料',
        snackbarProps: {
          color: 'error',
        },
      })
      restaurant.value = null
    } finally {
      loading.value = false
    }
  }

  // 新增評論用的雙向綁定物件
  const newReview = ref({
    content: '',
    score: 0,
    isAnonymous: false, // ⭐️ 預設為非匿名
  })

  const editingReviewId = ref(null)

  // 送出評論函式
  const submitReview = async () => {
    // ⛔ 沒登入就不能送出
    if (!user.isLoggedIn) {
      return createSnackbar({
        text: '請先登入才能留言',
        snackbarProps: { color: 'warning' },
      })
    }

    // ⛔ 必須填寫評論內容（你可以開啟判斷分數是否為 0）
    if (!newReview.value.content
      // || newReview.value.score === 0
    ) {
      return createSnackbar({
        text: '請填寫評論內容與評分',
        snackbarProps: { color: 'error' },
      })
    }

    try {
      // await reviewService.create(restaurant.value._id, { // 第一個參數放餐廳ID
      //   content: newReview.value.content,
      //   score: newReview.value.score,
      // })

      // createSnackbar({
      //   text: '評論送出成功',
      //   snackbarProps: { color: 'success' },
      // })

      // // 清空表單
      // newReview.value.content = ''
      // newReview.value.score = 0

      // // 重新載入餐廳資料，讓評論列表更新
      // await loadRestaurant()

      if (editingReviewId.value) {
        // 修改評論
        await reviewService.update(editingReviewId.value, {
          content: newReview.value.content,
          score: newReview.value.score,
          isAnonymous: newReview.value.isAnonymous, // ⭐️ 要加這個
        })
        createSnackbar({
          text: '評論修改成功',
          snackbarProps: { color: 'success' },
        })
      } else {
        // 新增評論
        await reviewService.create(restaurant.value._id, {
          content: newReview.value.content,
          score: newReview.value.score,
          isAnonymous: newReview.value.isAnonymous, // ⭐️ 要加這個
        })
        createSnackbar({
          text: '評論送出成功',
          snackbarProps: { color: 'success' },
        })
      }

      // 清空表單並更新評論列表
      // newReview.value.content = ''
      // newReview.value.score = 0

      newReview.value = { content: '', score: 0, isAnonymous: false }
      editingReviewId.value = null

      // await loadRestaurant()
      // await loadUserReview()
      // await loadRestaurantReviews()
      await refreshReviewData()
    } catch (error) {
      console.error('送出評論失敗', error)
      createSnackbar({
        // text: '評論送出失敗，請稍後再試',
        text: error.response?.data?.message || '評論送出失敗，請稍後再試',
        snackbarProps: { color: 'error' },
      })
    }
  }

  const loadUserReview = async () => {
    if (!user.isLoggedIn) return

    try {
      const { data } = await reviewService.getUserReview(restaurant.value._id)
      // if (data.success && data.data) {
      //   // 使用者有留過評論，進入編輯模式
      //   editingReviewId.value = data.data._id
      //   newReview.value.content = data.data.content
      //   newReview.value.score = data.data.score
      // }
      if (data.review) {
        editingReviewId.value = data.review._id
        newReview.value.content = data.review.content // ← 注意這邊可能是 `comment` 而不是 `content`
        newReview.value.score = data.review.score
        newReview.value.isAnonymous = data.review.isAnonymous ?? false
      }
    } catch (error) {
      // 沒有留過評論不需要處理錯誤
      console.log('使用者尚未評論或錯誤：', error.response?.data?.message)
    }
  }

  const reviews = ref([])

  const loadRestaurantReviews = async () => {
    if (!restaurant.value?._id) return
    try {
      const res = await reviewService.getByRestaurant(restaurant.value._id)
      reviews.value = res.data.result // 根據你的API回傳結構調整
    } catch (error) {
      console.error('載入評論失敗', error)
    }
  }

  const refreshReviewData = async () => {
    await loadRestaurant() // 載入餐廳資料（平均分數也在這）
    await loadUserReview() // 取得使用者自己的評論 → 決定是否編輯模式
    await loadRestaurantReviews() // 取得所有評論列表
  }

  function formatDate24 (dateString) {
    const date = new Date(dateString)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    const ss = String(date.getSeconds()).padStart(2, '0')
    return `${y}／${m}／${d}　${hh}：${mm}：${ss}`
  }

  // onMounted(loadRestaurant)
  // onMounted(async () => {
  //   await loadRestaurant()
  //   if (restaurant.value?._id && user.isLoggedIn) {
  //     await loadUserReview()
  //     await loadRestaurantReviews()
  //   }
  // })

  onMounted(async () => {
    // eslint-disable-next-line
    if (user.isLoggedIn) {
      await refreshReviewData() // ⏱️ 統一的刷新函式
    } else {
      await loadRestaurant() // 還是要載入基本資料
    }
  })

  // 如果你的應用可能在同一個頁面切換不同餐廳 ID，這個 watch 是必要的
  // watch(() => route.params.id, newId => {
  //   if (newId) {
  //     loadRestaurant()
  //     if (restaurant.value?._id && user.isLoggedIn) {
  //       loadUserReview()
  //     }
  //     loadRestaurantReviews()
  //   }
  // })
  watch(() => route.params.id, async newId => {
    if (!newId) return
    // eslint-disable-next-line
    if (user.isLoggedIn) {
      await refreshReviewData()
    } else {
      await loadRestaurant()
    }
  })
</script>

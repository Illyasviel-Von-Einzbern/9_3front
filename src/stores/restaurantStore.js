import restaurantApi from '@/services/restaurant'
// import * as restaurantApi from '@/services/restaurant'

export const useRestaurantStore = defineStore('restaurant', {
  state: () => ({
    restaurants: [],
    total: 0,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchAll ({ search = '', page = 1, limit = 9, category = '' }) {
      this.loading = true
      this.error = null

      console.log('fetchAll 被呼叫，參數:', { search, page, limit, category })

      try {
        const params = {
          page,
          limit,
        }

        if (search && typeof search === 'string' && search.trim()) {
          params.q = search.trim()
        }

        if (category && typeof category === 'string' && category.trim()) {
          params.category = category.trim()
        }

        console.log('發送給 API 的參數:', params)

        const res = await restaurantApi.getAll(params)
        console.log('API 回傳完整資料:', res)
        console.log('API 回傳完整資料2:', res.data)

        this.restaurants = res.data.data || res.data.restaurant || []
        this.total = res.data.total || 0

        console.log('處理後的餐廳資料:', this.restaurants)
        console.log('總數:', this.total)
        console.log('~~~~~~~~~~~搜尋參數：', search)
        console.log('~~~~~~~~~~~~~~~~API 回傳結果：', res.data)
      } catch (error) {
        this.error = error
        console.error('fetchAll 錯誤:', error)
      } finally {
        this.loading = false
      }
    },
    async createRestaurant (data) {
      this.loading = true
      this.error = null
      try {
        const res = await restaurantApi.create(data)
        // 新增後，把資料加入 local state，方便更新畫面（如果你想）
        this.restaurants.push(res.data)
        return res.data
      } catch (error) {
        this.error = error
        console.error(error)
        throw error // 讓呼叫端能捕捉錯誤
      } finally {
        this.loading = false
      }
    },
    async createMenu (restaurantId, menuData) {
      try {
        await restaurantApi.createMenu(restaurantId, menuData)
      } catch (error) {
        console.error('新增菜單失敗', error)
        throw error
      }
    },
  },
})

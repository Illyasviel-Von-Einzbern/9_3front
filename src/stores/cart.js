import { defineStore } from 'pinia'
import { useSnackbar } from 'vuetify-use-dialog'
import apiService from '@/services/api'
import { useUserStore } from './user'

export const useCartStore = defineStore('cart', () => {
  const user = useUserStore()
  const createSnackbar = useSnackbar()

  /**
   * 將商品加入訂單 (直接建立一筆新訂單)
   * @param {object} item - 包含餐廳和菜單資訊的物件
   * @returns {boolean} - 是否成功加入
   */
  const addItem = async item => {
    if (!user.isLoggedIn) {
      createSnackbar({
        text: '請先登入',
        snackbarProps: { color: 'error' },
      })
      return false
    }

    try {
      // 假設後端有一個 /orders 的端點用來建立訂單
      await apiService.apiAuth.post('/orders', {
        restaurantId: item.restaurantId,
        items: [{
          menuItemId: item._id,
          quantity: item.quantity,
        }],
      })

      createSnackbar({
        text: `已將 ${item.name} 加入訂單`,
        snackbarProps: { color: 'success' },
      })
      return true // 代表成功
    } catch (error) {
      console.error('加入訂單失敗', error)
      createSnackbar({
        text: error.response?.data?.message || '加入訂單失敗',
        snackbarProps: { color: 'error' },
      })
      return false // 代表失敗
    }
  }

  return {
    addItem,
  }
})
